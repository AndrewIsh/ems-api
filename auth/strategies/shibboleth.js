const fs = require('fs');
const passport = require('passport');
const bcrypt = require('bcrypt');
const SamlStrategy = require('passport-saml').Strategy;

const db = require('../../../ems-db');
const { generateRefresh, addRefreshToken } = require('../../helpers/token');
const { shibConfig } = require('../utils');

const Shibboleth = (app) => {
    // Get the details we need from the config for creating
    // our strategy
    const {
        hasShib,
        CALLBACK_URL,
        ENTRY_POINT,
        ISSUER,
        SP_CERT,
        SP_PRIV_KEY,
        IDP_CERT
    } = shibConfig();

    // Only proceed if we're using this strategy
    if (!hasShib) {
        return app;
    }

    const strategyOptions = {
        // URL that goes from the Identity Provider -> Service Provider
        callbackUrl: CALLBACK_URL,
        // URL that goes from the Service Provider -> Identity Provider
        entryPoint: ENTRY_POINT,
        // Usually specified as `/shibboleth` from site root
        issuer: ISSUER,
        // Service Provider private key
        decryptionPvk: fs.readFileSync(SP_PRIV_KEY, 'utf8').replace(/\n/gm, ''),
        // Identity Provider's public key (as a single line)
        cert: fs.readFileSync(IDP_CERT, 'utf8').replace(/\n/gm, ''),
        // Do not request authentication context, can help with ADFS
        // See: https://github.com/node-saml/passport-saml/issues/226
        disableRequestedAuthnContext: true
    };

    const verifyCallback = (profile, done) => {
        // Take the response and extract the info we need to
        // create / update the user
        const {
            [process.env.SHIB_UID_ATTR]: uid,
            [process.env.SHIB_FIRST_NAME_ATTR]: firstName,
            [process.env.SHIB_LAST_NAME_ATTR]: lastName,
            [process.env.SHIB_EMAIL_ATTR]: email
        } = profile;

        // First identify whether this user already exists. We can't do this
        // with a straight lookup because we need to identify them using
        // the bcrypt.compare method, so we grab all users and find them
        db.resolvers.users.allUsers({ query: {} }).then((allUsers) => {
            // Note: This is potentially a slow operation as we're performing a
            // *synchronous* compare on, potentially, every user. Since
            // these synchronous calls block the main thread, we may want to
            // switch to the async approach discussed in the bcrypt module's
            // docs if this becomes problematic. However, since this only
            // gets called when a user logs in, it's not going to be
            // heavily hit
            const found = allUsers.rows.find((user) =>
                bcrypt.compareSync(uid, user.provider_id)
            );

            // Shib can provide sensitive information as an identifier
            // so we should hash it before storage
            let hashedProviderId = '';

            if (!found) {
                hashedProviderId = bcrypt.hashSync(uid, 10);
            } else {
                hashedProviderId = found.provider_id;
            }

            db.resolvers.users
                .upsertUserByProviderId({
                    provider: 'shibboleth',
                    providerId: hashedProviderId,
                    name: `${firstName} ${lastName}`,
                    email
                })
                .then((result) => {
                    if (result.rowCount === 1) {
                        done(null, result.rows[0]);
                    } else {
                        done('Error updating user record in database', null);
                    }
                })
                .catch((err) => done(err, null));
        });
    };

    const shibStrategy = new SamlStrategy(strategyOptions, verifyCallback);
    passport.use(shibStrategy);

    // Add our routes for forwarding to the IdP...
    app.get('/auth/shibboleth', passport.authenticate('saml'));

    // ...and returning from the IdP
    app.post(
        '/auth/shibboleth/callback',
        passport.authenticate('saml', {
            failureRedirect: '/login'
        }),
        (req, res) => {
            // Generate a refresh token and redirect the useragent back to
            // the client, at which point they will use the refresh token
            // to obtain a JWT
            const token = generateRefresh(req.user);
            addRefreshToken(res, token);
            const port =
                process.env.CLIENT_PORT.length > 0
                    ? `:${process.env.CLIENT_PORT}`
                    : '';
            return res.redirect(302, `${process.env.CLIENT_HOST}${port}`);
        }
    );

    app.get(
        '/Shibboleth.sso/Metadata', 
        (req, res) => {
            const cert = fs.readFileSync(SP_CERT, 'utf8').replace(/\n/gm, '');
            const metadata = shibStrategy.generateServiceProviderMetadata(cert);
            res.type('application/xml');
            res.status(200).send(metadata);
        }
    );

    return app;
};

module.exports = Shibboleth;

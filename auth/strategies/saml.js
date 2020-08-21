const passport = require('passport');
const bcrypt = require('bcrypt');
const SamlStrategy = require('passport-saml').Strategy;

const db = require('../../../ems-db');
const { generateRefresh, addRefreshToken } = require('../../helpers/token');
const { samlConfig } = require('../utils');

const Saml = (app) => {

    // Get the details we need from the config for creating
    // our strategy
    const { hasSaml, ENTRY_POINT, ISSUER_STRING, LOGOUT_URL } = samlConfig();

    // Only proceed if we're using this strategy
    if (!hasSaml) {
        return app;
    }

    const strategyOptions = {
        path: '/auth/saml/callback',
        logoutUrl: LOGOUT_URL,
        entryPoint: ENTRY_POINT,
        issuer: ISSUER_STRING
    };

    const verifyCallback = (profile, done) => {
        // Take the response and extract the info we need to
        // create / update the user
        const {
            [process.env.SAML_UID_ATTR]: uid,
            'User.FirstName': firstName,
            'User.LastName': lastName
        } = profile;

        // First identify whether this user already exists. We can't do this
        // with a straight lookup because we need to identify them using
        // the bcrypt.compare method, so we grab all users and find them
        db.resolvers.users.allUsers({ query: {} }).then((allUsers) => {
            // Note: This is potentially a slow operation as we're performing a
            // *synchronous* compare on, potentially, every user. Since
            // these synchronous calls block the main thread, we may want to switch
            // to the async approach discussed in the bcrypt module's docs if this
            // becomes problematic. However, since this only gets called when a user
            // logs in, it's not going to be heavily hit
            const found = allUsers.rows.find(
                (user) => bcrypt.compareSync(uid, user.provider_id)
            );

            // SAML can provide sensitive information as an identifier
            // so we should hash it before storage
            let hashedProviderId = '';

            if (!found) {
                hashedProviderId = bcrypt.hashSync(uid, 10);
            } else {
                hashedProviderId = found.provider_id;
            }

            db.resolvers.users
                .upsertUserByProviderId({
                    provider: 'saml',
                    providerId: hashedProviderId,
                    name: `${firstName} ${lastName}`
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

    }

    passport.use(new SamlStrategy(strategyOptions, verifyCallback));

    // Add our routes for forwarding to the IdP...
    app.get('/auth/saml',
        passport.authenticate('saml')
    );

    // ...and returning from the IdP
    app.post('/auth/saml/callback',
        passport.authenticate(
            'saml',
            {
                failureRedirect: '/login'
            }
        ),
        (req, res) => {
            // Generate a refresh token and redirect the useragent back to the client,
            // at which point they will use the refresh token to obtain a JWT
            const token = generateRefresh(req.user);
            addRefreshToken(res, token);
            const port = process.env.CLIENT_PORT.length > 0 ? `:${process.env.CLIENT_PORT}` : '';
            return res.redirect(302, `${process.env.CLIENT_HOST}${port}`);
        }
    );
}

module.exports = Saml;
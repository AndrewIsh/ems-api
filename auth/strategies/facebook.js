const passport = require('passport');
const FacebookStrategy = require('passport-facebook').Strategy;

const db = require('../../../ems-db');
const { generateRefresh, addRefreshToken } = require('../../helpers/token');
const { facebookConfig } = require('../utils');

const Facebook = (app) => {
    // Get the details we need from the config for creating
    // our strategy
    const {
        hasFacebook,
        APP_ID,
        APP_SECRET
    } = facebookConfig();

    // Only proceed if we're using this strategy
    if (!hasFacebook) {
        return app;
    }

    const strategyOptions = {
        clientID: APP_ID,
        clientSecret: APP_SECRET,
        callbackURL: `${process.env.CLIENT_HOST}/auth/facebook/callback`,
        enableProof: true,
        profileFields: ['id', 'email', 'displayName', 'picture.type(large)']
    };

    // When we get back from Facebook, use the info we've received to look up
    // the user / provider combination. If they don't exist, create them
    const verifyCallback = (accessToken, refreshToken, profile, done) => {
        // Take what we've received from Facebook, create or update the user
        // then pass the result forward
        const { id, name, email, picture } = profile._json;
        db.resolvers.users
            .upsertUserByProviderId({
                provider: 'facebook',
                providerId: id,
                name,
                email,
                avatar: picture.data.url
            })
            .then((result) => {
                if (result.rowCount === 1) {
                    done(null, result.rows[0]);
                } else {
                    done(
                        'Error adding / updating user record in database',
                        null
                    );
                }
            })
            .catch((err) => done(err, null));
    };

    passport.use(new FacebookStrategy(strategyOptions, verifyCallback));

    // Add our routes for forwarding to Facebook...
    app.get(
        '/auth/facebook',
        passport.authenticate(
            'facebook',
            { scope: ['email'] }
        )
    );

    // ...and returning from Facebook
    app.get(
        '/auth/facebook/callback',
        passport.authenticate('facebook', {
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

    return app;
};

module.exports = Facebook;

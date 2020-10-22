const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

const db = require('../../../ems-db');
const { generateRefresh, addRefreshToken } = require('../../helpers/token');
const { googleConfig } = require('../utils');

const Google = (app) => {
    // Get the details we need from the config for creating
    // our strategy
    const { hasGoogle, CLIENT_ID, CLIENT_SECRET } = googleConfig();

    // Only proceed if we're using this strategy
    if (!hasGoogle) {
        return app;
    }

    const strategyOptions = {
        clientID: CLIENT_ID,
        clientSecret: CLIENT_SECRET,
        callbackURL: '/auth/google/callback'
    };

    // When we get back from Google, use the info we've received to look up
    // the user / provider combination. If they don't exist, create them
    const verifyCallback = (accessToken, refreshToken, profile, done) => {
        // Take what we've received from Google, create or update the user
        // then pass the result forward
        const { sub, name, email, picture } = profile._json;
        db.resolvers.users
            .upsertUserByProviderId({
                provider: 'google',
                providerId: sub,
                name,
                email,
                avatar: picture,
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

    passport.use(new GoogleStrategy(strategyOptions, verifyCallback));

    // Add our routes for forwarding to Google...
    app.get(
        '/auth/google',
        passport.authenticate('google', {
            // Request profile and user email
            scope: [
                'https://www.googleapis.com/auth/userinfo.profile',
                'https://www.googleapis.com/auth/userinfo.email'
            ]
        })
    );

    // ...and returning from Google
    app.get(
        '/auth/google/callback',
        passport.authenticate('google', {
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

module.exports = Google;

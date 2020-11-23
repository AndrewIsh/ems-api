const passport = require('passport');
const session = require('express-session');
const TwitterStrategy = require('passport-twitter').Strategy;

const db = require('../../../ems-db');
const { generateRefresh, addRefreshToken } = require('../../helpers/token');
const { twitterConfig } = require('../utils');

const Twitter = (app) => {
    // Get the details we need from the config for creating
    // our strategy
    const {
        hasTwitter,
        CONSUMER_KEY,
        CONSUMER_SECRET,
        COOKIE_SECRET
    } = twitterConfig();

    // Only proceed if we're using this strategy
    if (!hasTwitter) {
        return app;
    }

    app.use(session({
        secret: COOKIE_SECRET,
        resave: false,
        saveUninitialized: true
    }));

    app.use(passport.session());

    const strategyOptions = {
        consumerKey: CONSUMER_KEY,
        consumerSecret: CONSUMER_SECRET,
        callbackURL: `${process.env.CLIENT_HOST}/auth/twitter/callback`,
        includeEmail: true
    };

    // When we get back from Twitter, use the info we've received to look up
    // the user / provider combination. If they don't exist, create them
    const verifyCallback = (accessToken, tokenSecret, profile, done) => {
        // Take what we've received from Twitter, create or update the user
        // then pass the result forward
        const { id_str, name, email, profile_image_url_https } = profile._json;
        db.resolvers.users
            .upsertUserByProviderId({
                provider: 'twitter',
                providerId: id_str,
                name,
                email,
                avatar: profile_image_url_https
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

    passport.use(new TwitterStrategy(strategyOptions, verifyCallback));

    // Add our routes for forwarding to Twitter...
    app.get(
        '/auth/twitter',
        passport.authenticate('twitter')
    );

    // ...and returning from Twitter
    app.get(
        '/auth/twitter/callback',
        passport.authenticate('twitter', {
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

module.exports = Twitter;

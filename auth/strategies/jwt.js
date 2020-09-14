const passport = require('passport');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const { getTokenFromRequest, verifyJwt } = require('../../helpers/token');

const db = require('../../../ems-db');

const Jwt = () => {
    const strategyOptions = {
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey: process.env.JWT_SECRET,
        passReqToCallback: true
    };

    // The callback that passport-jwt calls once it has SUCCESSFULLY
    // extracted a token from the request. The case where it is
    // unsuccessful does not call this callback, so we're using a
    // Passport custom callback (postJwtAuth) to catch that case
    const verifyCallback = async (req, jwtPayload, done) => {
        // passport-jwt is happy, so let's check if this token is
        // good and we have a user associated with it
        const jwtToken = getTokenFromRequest(req);
        try {
            verifyJwt(jwtToken);
            const user = await db.resolvers.users.getUser({
                params: { id: jwtPayload.sub }
            });
            if (user.rowCount === 1) {
                return done(null, user.rows[0]);
            } else {
                return done('User not found');
            }
        } catch (err) {
            return done(err);
        }
    };

    passport.use(new JwtStrategy(strategyOptions, verifyCallback));
};

module.exports = Jwt;

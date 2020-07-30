const { v4 } = require('uuid');
const jwt = require('jsonwebtoken');
const passport = require('passport');

const TokenCache = require('../helpers/TokenCache');

// Given an Express request object, extract the JWT
const getTokenFromRequest = (req) => {
    const authHeader = req.headers.authorization;
    return authHeader ? authHeader.split(' ')[1] : null;
};

// Given a JWT, return the user's ID within it
const getIdFromToken = (token) => {
    const decoded = jwt.decode(token, { json: true });
    return decoded.sub;
};

// Take a user object and sign a JWT containing their ID
const generateJwt = (userId) => {
    // JWTs last 15 minutes
    const expiresIn = 900;
    return jwt.sign({ sub: userId }, process.env.JWT_SECRET, {
        expiresIn
    })
};

// Receive a JWT payload and verify it
const verifyJwt = (payload) => {
    try {
        return jwt.verify(payload, process.env.JWT_SECRET);
    } catch (err) {
        throw (err);
    }
};

// Generate and store a refresh token
const generateRefresh = (userId) => {
    const newToken = v4();
    TokenCache.storeToken({ userId, newToken });
    return newToken;
}

// Find and delete a refresh token
const deleteRefresh = (token) => {
    TokenCache.deleteToken(token);
};

// Add a refresh token to a response object
// Refresh tokens last a week
const addRefreshToken = (res, token) => {
    const options = {
        httpOnly: true,
        sameSite: 'Strict',
        maxAge: 604800000
    };
    // If we're in production mode (i.e. under HTTPS),
    // we can also add 'secure'
    if (process.env.NODE_ENV === 'production') {
        options.secure = true;
    }
    res.cookie('refresh_token', token, options);
    return res;
};

// Passport custom callback to determine if passport-jwt
// failed JWT validation or not
const postJwtAuth = (req, res, next) => {
    return passport.authenticate('jwt', (err, user, info) => {
        // If the JWT authentication failed
        // attempt to refresh with the refresh token
        if (!user) {
            doRefresh(req, res, next);
        } else {
            next();
        }
    })(req, res, next);
}

// Middleware to handle refresh tokens
// Receive a refresh token which may or may not be valid
// Try and find the user associated with it, if the user
// exists, generate a new JWT and new refresh token.
// Set the refresh in a cookie, set an Authorization header
// containing the JWT.
// If we fail for any reason, return 401
const doRefresh = (req, res, next) => {
    // First check for the token in the cookie
    const currentToken = req.cookies.refresh_token;
    if (currentToken) {
        // We have a token, find the user that it belongs to
        const userId = TokenCache.findByToken(currentToken);
        if (userId) {
            const jwt = generateJwt(userId);
            try {
                const newRefresh = generateRefresh(userId);
                res.set('Authorization', `Bearer ${jwt}`);
                addRefreshToken(res, newRefresh);
                res.status(200);
                res.send()
                next();
            } catch (err) {
                res.status(401);
                res.send('Unable to generate refresh token');
                next();
            }
        } else {
            res.status(401);
            res.send('Invalid refresh token');
            next();
        }
    } else {
        res.status(401);
        res.send('Missing refresh token');
        next();
    }
};

module.exports = {
    getTokenFromRequest,
    getIdFromToken,
    generateJwt,
    verifyJwt,
    generateRefresh,
    deleteRefresh,
    addRefreshToken,
    postJwtAuth,
    doRefresh
};

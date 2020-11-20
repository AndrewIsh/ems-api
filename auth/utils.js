const passport = require('passport');

const db = require('../../ems-db');

const serializeCallback = (user, done) => done(null, user.provider_id);

const deserializeCallback = async ({ id }, done) => {
    try {
        const user = await db.resolvers.users.getUser({ params: { id } });
        return done(null, user);
    } catch (err) {
        return done(err, null);
    }
};

const setup = () => {
    passport.serializeUser(serializeCallback);
    passport.deserializeUser(deserializeCallback);
};

const getAvailableAuthtypes = () => {
    const availableMethods = [];

    const { hasGoogle, NAME: googleName } = googleConfig();
    if (hasGoogle) {
        availableMethods.push({ id: 'google', name: googleName });
    }

    const { hasSaml, NAME: samlName, LOGOUT_ENDPOINT } = samlConfig();
    if (hasSaml) {
        availableMethods.push({
            id: 'saml',
            name: samlName,
            logoutUrl: LOGOUT_ENDPOINT
        });
    }

    const { hasShib, NAME: shibName } = shibConfig();
    if (hasShib) {
        availableMethods.push({
            id: 'shibboleth',
            name: shibName
        });
    }

    return availableMethods;
};

const googleConfig = () => {
    const config = {
        CLIENT_ID: process.env.GOOGLE_OAUTH_CLIENT_ID,
        CLIENT_SECRET: process.env.GOOGLE_OAUTH_CLIENT_SECRET,
        NAME: process.env.GOOGLE_NAME || 'Google'
    };
    return {
        ...config,
        hasGoogle: config.CLIENT_ID !== 'null' && config.CLIENT_SECRET !== 'null' ? true : false
    };
};

const samlConfig = () => {
    const config = {
        ENTRY_POINT: process.env.SAML_ENTRY_POINT,
        ISSUER_STRING: process.env.SAML_ISSUER_STRING,
        LOGOUT_ENDPOINT: process.env.SAML_LOGOUT_ENDPOINT,
        NAME: process.env.SAML_NAME || 'SAML'
    };

    const hasSaml = () => {
        return config.ENTRY_POINT !== 'null' &&
            config.ISSUER_STRING !== 'null' &&
            config.LOGOUT_ENDPOINT !== 'null'
            ? true
            : false;
    };

    return {
        ...config,
        hasSaml: hasSaml()
    };
};

const shibConfig = () => {
    const requiredProps = [
        'CALLBACK_URL',
        'ENTRY_POINT',
        'ISSUER',
        'SP_PRIV_KEY',
        'SP_CERT',
        'IDP_CERT',
        'UID_ATTR',
        'FIRST_NAME_ATTR',
        'LAST_NAME_ATTR',
        'EMAIL_ATTR'
    ];
    const config = {};
    requiredProps.forEach(
        (prop) => {
            const val = process.env[`SHIB_${prop}`];
            if (val !== 'null') {
                config[prop] = val;
            }
        }
    );
    config.NAME = process.env.SHIB_NAME || 'Shibboleth';

    // +1 because we added the name property manually
    const hasShib = () =>
        Object.keys(config).length === requiredProps.length + 1;

    return {
        ...config,
        hasShib: hasShib()
    };
};

const checkIsInRole = (...roles) => (req, res, next) => {
    if (!req.user) {
        res.status(401);
        res.send('User not found');
        return next();
    }
    const hasRole = roles.find((role) => req.user.role_code === role);
    if (!hasRole) {
        res.status(401);
        res.send('Role not found');
        return next();
    }

    return next();
};

module.exports = {
    serializeCallback,
    deserializeCallback,
    setup,
    googleConfig,
    samlConfig,
    shibConfig,
    getAvailableAuthtypes,
    checkIsInRole
};

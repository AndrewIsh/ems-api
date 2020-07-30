const { getAvailableAuthtypes } = require('../auth/utils');

const authtypes = {
    getAuthtypes: (req, res, next) => {
        const types = getAvailableAuthtypes();
        res.json(types);
        next();
    }
};

module.exports = authtypes;

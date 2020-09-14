const db = require('../../ems-db');
const { getTokenFromRequest, getIdFromToken } = require('../helpers/token');

const activeUser = {
    // The token will have been validated by the time we get here
    // so we can safely use it
    getActiveUser: (req, res, next) => {
        const token = getTokenFromRequest(req);
        const id = getIdFromToken(token);
        db.resolvers.users.getUser({ params: { id } }).then((result) => {
            if (result.rowCount === 1) {
                res.json(result.rows[0]);
                next();
            } else {
                res.status(404);
                res.send();
                next();
            }
        });
    }
};

module.exports = activeUser;

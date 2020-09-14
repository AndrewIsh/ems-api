const db = require('../../ems-db');

const roles = {
    getRoles: (req, res, next) =>
        db.resolvers.roles
            .allRoles(req)
            .then((result) => {
                res.json(result.rows);
                next();
            })
            .catch((err) => {
                next(err);
            })
};

module.exports = roles;

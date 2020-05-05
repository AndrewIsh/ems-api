const db = require('../../ems-db');

const users = {
    getUsers: (req, res, next) =>
        db.resolvers.users
            .allUsers(req)
            .then((result) => {
                res.json(result.rows);
                next();
            })
            .catch((err) => {
                next(err);
            }),
    getUser: (req, res, next) =>
        db.resolvers.users
            .getUser(req)
            .then((result) => {
                if (result.rowCount > 1) {
                    res.status(500);
                    res.send();
                    next();
                } else if (result.rowCount === 1) {
                    res.json(result.rows[0]);
                    next();
                } else {
                    res.status(404);
                    res.send();
                    next();
                }
            })
            .catch((err) => next(err)),
    upsertUser: (req, res, next) =>
        db.resolvers.users
            .upsertUser(req)
            .then((result) => {
                if (result.rowCount === 0) {
                    res.status(404);
                    res.send();
                    next();
                } else {
                    res.status(req.method === 'POST' ? 201 : 200);
                    res.json(result.rows[0]);
                    next();
                }
            })
            .catch((err) => next(err)),
    deleteUser: (req, res, next) =>
        db.resolvers.users
            .deleteUser(req)
            .then((result) => {
                if (result.rowCount === 0) {
                    res.status(404);
                    res.send();
                    next();
                } else if (result.rowCount === 1) {
                    res.status(204);
                    res.json({});
                    next();
                } else {
                    res.status(500);
                    res.send();
                    next();
                }
            })
            .catch((err) => next(err))
};

module.exports = users;

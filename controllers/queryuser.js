const db = require('../../ems-db');

const queryuser = {
    addUserToQuery: (req, res, next) =>
        db.resolvers.queryuser
            .addUserToQuery(req)
            .then((result) => {
                if (result.rowCount === 1) {
                    res.status(201);
                    res.json(result.rows[0]);
                    next();
                } else {
                    res.status(500);
                    res.send();
                    next();
                }
            })
            .catch((err) => next(err)),
    updateMostRecentSeen: (req, res, next) =>
        db.resolvers.queryuser
            .updateMostRecentSeen(req)
            .then((result) => {
                if (result.rowCount === 0) {
                    res.status(404);
                    res.send();
                    next();
                } else if (result.rowCount === 1) {
                    res.status(200);
                    res.json(result.rows[0]);
                    next();
                } else {
                    res.status(500);
                    res.send();
                    next();
                }
            })
            .catch((err) => next(err))
};

module.exports = queryuser;

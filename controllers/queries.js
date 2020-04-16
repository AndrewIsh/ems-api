const db = require('../../ems-db');

const queries = {
    getQueries: (req, res, next) =>
        db.resolvers.queries
            .allQueries(req)
            .then((result) => {
                res.json(result.rows);
                next();
            })
            .catch((err) => {
                next(err);
            }),
    getQuery: (req, res, next) =>
        db.resolvers.queries
            .getQuery(req)
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
    upsertQuery: (req, res, next) =>
        db.resolvers.queries
            .upsertQuery(req)
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
    deleteQuery: (req, res, next) =>
        db.resolvers.queries
            .deleteQuery(req)
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

module.exports = queries;

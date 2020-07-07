const db = require('../../ems-db');

const helpers = require('../helpers/queries');

const queries = {
    getQueries: async (req, res, next) => {
        // Here we're taking the approach of reducing hitting the DB in
        // favour of munging the data back together here. This should help
        // scaling with large numbers of queries & messages
        try {
            // First get the queries we're dealing with
            const queries = await db.resolvers.queries.allQueries(req);
            const toSend = await helpers.addEmbeds(queries);
            res.json(toSend);
            next();
        } catch (err) {
            next(err);
        }
    },
    getQuery: async (req, res, next) => {
        try {
            const query = await db.resolvers.queries.getQuery(req);
            if (query.rowCount > 1) {
                res.status(500);
                res.send();
                next();
            } else if (query.rowCount === 1) {
                const toSend = await helpers.addEmbeds(query);
                res.json(toSend[0]);
                next();
            } else {
                res.status(404);
                res.send();
                next();
            }
        } catch (err) {
            next(err);
        }
    },
    upsertQuery: async (req, res, next) => {
        try {
            const result = await db.resolvers.queries.upsertQuery(req);
            if (result.rowCount === 0) {
                res.status(404);
                res.send();
                next();
            } else {
                const toSend = await helpers.addEmbeds(result);
                res.status(req.method === 'POST' ? 201 : 200);
                res.json(toSend[0]);
                next();
            }
        } catch (err) {
            next(err);
        }
    },
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

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
            // Add the queries we retrieved, for the benefit
            // of any side effect middleware
            req.wsData = { queries: queries.rows };
            const toSend = await helpers.addEmbeds(queries.rows);
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
                const toSend = await helpers.addEmbeds(query.rows);
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
                const toSend = await helpers.addEmbeds(result.rows);
                // Add queryuser entries for any users that need it
                await db.resolvers.queryuser.upsertQueryUsers({
                    query_id: toSend[0].id,
                    creator: req.user.id
                });
                res.status(req.method === 'POST' ? 201 : 200);
                res.json(toSend[0]);
                // Make the queries available to the websockets
                // sending middleware
                req.wsData = { queries: toSend };
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
            .catch((err) => next(err)),
    updateBulk: (req, res, next) => {
        const updates = db.resolvers.queries.updateBulk(req);
        // Wait until all updates are complete (we're allowing for the fact
        // that some may fail, hence allSettled)
        return Promise.allSettled(updates).then(async (results) => {
            // Prepare a response containing the updated query objects
            // We're not specifically handling updates that failed here.
            // The could be idenfitied by looking at
            // result.status === 'rejected' but what to do in that
            // situation ? Needs more thought, as it stands any updates
            // that fail will just remain unchanged in the UI
            //
            // Just get the query objects
            const resultArray = results.map(
                (thisResult) => thisResult.value.rows[0]
            );
            const embedded = await helpers.addEmbeds(resultArray);
            req.wsData = { queries: embedded };
            res.status(200);
            res.json(embedded);
            next();
        });
    }
};

module.exports = queries;

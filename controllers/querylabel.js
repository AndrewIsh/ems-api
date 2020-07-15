const db = require('../../ems-db');

const helpers = require('../helpers/queries');

const querylabel = {
    addRemove: (req, res, next, action) => {
        // Here I am electing to call the DB resolver once for each
        // relationship. It would be possible to modify the query itself
        // to insert/delete all rows in a single operation, but this method
        // is clearer. If I see performance issues related to this, a switch
        // to an atomic action should fix it. We are also getting each updated
        // query individually, this could be enhanced similarly
        //
        // We can behave as if we're getting multiple IDs, where we may
        // actually only be getting one
        const queryLabels = req.params.query_id.split(',');

        // Establish what resolver we need
        const dbResolver = db.resolvers.querylabel[action];
        // Resolvers return promises, so create an array of them
        const updates = queryLabels.map((queryId) => dbResolver(
            { params: { query_id: queryId, label_id: req.params.label_id } }
        ));
        // When all DB operations are complete, get all updated queries
        // and return them
        return Promise.all(updates).then(async (responses) => {
            const out = queryLabels.map(async (queryId) => {
                const query = await db.resolvers.queries.getQuery({
                    params: { id: queryId }
                });
                const embedded = await helpers.addEmbeds(query);
                return embedded[0];
            });
            Promise.all(out).then((toReturn) => {
                res.status(200);
                res.json(toReturn);
                next();
            });
        })
        .catch((err) => next(err));

    }
};

module.exports = querylabel;

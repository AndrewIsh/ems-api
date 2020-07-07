const db = require('../../ems-db');

const helpers = require('../helpers/queries');

const querylabel = {
    addRemove: (req, res, next, action) => {
        const func = db.resolvers.querylabel[action];
        return func(req).then(async (response) => {
            if (response.rowCount === 0) {
                res.status(404);
                res.send();
                next();
            } else if (response.rowCount === 1) {
                // Fetch and return the updated query object
                const queries = await db.resolvers.queries.getQuery({
                    params: { id: req.params.query_id }
                });
                const toSend = await helpers.addEmbeds(queries);
                res.status(200);
                res.json(toSend[0]);
                next();
            } else {
                res.status(500);
                res.send();
                next();
            }
        })
        .catch((err) => next(err));

    }
};

module.exports = querylabel;

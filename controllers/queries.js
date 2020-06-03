const db = require('../../ems-db');

const addEmbeds = async (queries) => {
    // We need the IDs of all queries we received
    const query_ids = queries.rows.map(query => query.id);
    // Now get the initiators for all the queries we've
    // received, we also receive their associated query ID
    const initiators = await db.resolvers.queries.initiators(
        query_ids
    );
    // Now get the participants of all retrieved queries
    const participants = await db.resolvers.queries.participants(
        query_ids
    );
    // Finally get the most recent message for each retrieved query
    const latest = await db.resolvers.queries.latestMessages(
        query_ids
    );
    // Now we have everything, we can bundle it all up together
    return queries.rows.map(query => {
        // The initiator for this query
        const queryInitiator = initiators.rows.find(
            init => init.id === query.id
        ).initiator;
        // The participants of this query
        const queryParticipants = participants.rows.filter(
            participant => participant.query_id === query.id
        ).map(final => final.creator_id);
        // The most recent message for this query
        const queryLatest = latest.rows.find(
            latestMessage => latestMessage.query_id === query.id
        );
        return {
            ...query,
            initiator: queryInitiator,
            participants: queryParticipants,
            latestMessage: queryLatest
        };
    });
};

const queries = {
    getQueries: async (req, res, next) => {
        // Here we're taking the approach of reducing hitting the DB in
        // favour of munging the data back together here. This should help
        // scaling with large numbers of queries & messages
        try {
            // First get the queries we're dealing with
            const queries = await db.resolvers.queries.allQueries(req);
            const toSend = await addEmbeds(queries);
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
                const toSend = await addEmbeds(query);
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

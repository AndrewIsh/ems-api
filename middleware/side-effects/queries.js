const WebsocketServer = require('../../helpers/WebsocketServer');
const db = require('../../../ems-db');
const helpers = require('../../helpers/queries');

const queries = {
    // Inform all clients that a query has been updated
    updatedQueryToClients: async (req, res, next) => {
        const { message } = req.wsData;
        const query = await db.resolvers.queries.getQuery(
            { params: { id: message.query_id } }
        );
        const toSend = await helpers.addEmbeds(query);
        // Send the updated query via the websocket
        WebsocketServer.broadcastMessage({
            subject: 'query',
            action: 'update',
            payload: toSend
        });
        next();
    },
    // Send updated most recent seen to a user
    mostRecentSeenToClient: async (req, res, next) => {
        const mostRecentSeen = await db.resolvers.queryuser.getMostRecentSeen(req.user);
        if (mostRecentSeen.rowCount > 0) {
            // Create an object of most recent seen, for this user,
            // keyed on query ID
            // e.g. { 21: 3, 22: 0, 23: 1 }
            const toSend = mostRecentSeen.rows.reduce(
                (acc, val) => ({ ...acc, [val.query_id]: val.most_recent_seen }),
                {}
            );
            WebsocketServer.onlyInitiatorMessage({
                initiator: req.user.id,
                subject: 'mostRecentSeen',
                action: 'update',
                payload: toSend
            });
        }
        next();
    },
    // Send updated unseen counts for a given user
    userUnseenCountsToClient: async (req, res, next) => {
        const { query_ids } = req.wsData;

        const unseenCounts = await db.resolvers.queryuser.getUserUnseenCounts({
            query_ids, user_id: req.user.id
        });

        if (unseenCounts.rowCount > 0) {
            // Create an object of unseen counts, for this user,
            // keyed on query ID
            // e.g. { 21: 3, 22: 0, 23: 1 }
            const toSend = unseenCounts.rows.reduce(
                (acc, val) => ({ ...acc, [val.query_id]: val.unseen_count }),
                {}
            );
            WebsocketServer.onlyInitiatorMessage({
                initiator: req.user.id,
                subject: 'unseenCount',
                action: 'update',
                payload: toSend
            });
        }
        next();
    },
    // Send updated unseen counts to anyone who can see
    // the given query
    queryUnseenCountsToClients: async (req, res, next) => {
        const { message } = req.wsData;

        const unseenCounts = await db.resolvers.queryuser.getParticipantUnseenCounts({
            query_id: message.query_id
        });

        if (unseenCounts.rowCount > 0) {
            // Send a message to each user
            unseenCounts.rows.forEach((row) => {
                WebsocketServer.onlyInitiatorMessage({
                    initiator: row.user_id,
                    subject: 'unseenCount',
                    action: 'update',
                    payload: { [message.query_id]: row.unseen_count }
                });
            });
        }
        next();
    }
};

module.exports = queries;
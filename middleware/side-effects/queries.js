const WebsocketServer = require('../../helpers/WebsocketServer');
const db = require('../../../ems-db');
const helpers = require('../../helpers/queries');

const queries = {
    createdQueryToClients: async (req, res, next) => {
        const { queries } = req.wsData;
        // Send the updated query via the websocket
        // but not to the user who created the message
        WebsocketServer.excludeInitiatorMessage({
            initiator: queries[0].initiator,
            subject: 'query',
            action: 'create',
            payload: queries[0]
        });
        next();
    },
    // Inform all clients that queries have been updated
    updatedQueriesToClients: async (req, res, next) => {
        const { queries } = req.wsData;
        const toSend = await helpers.addEmbeds(queries);
        // Send the updated query via the websocket
        WebsocketServer.broadcastMessage({
            subject: 'query',
            action: 'update',
            payload: toSend
        });
        next();
    },
    // Send the most recent seen counts to all connected clients
    mostRecentSeenToAll: async (req, res, next) => {
        const allClients = WebsocketServer.connectedClientUserIds();
        allClients.forEach((id) => {
            queries.mostRecentSeenToClient(
                { user: { id } },
                null,
                next
            )
        });
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
    // Send updated unseen counts to anyone who is connected and
    // can see the given query
    queryUnseenCountsToClients: async (req, res, next) => {
        const { message } = req.wsData;

        const connectedClients = WebsocketServer.connectedClientUserIds();

        // Get the unseen counts for every participant of this query
        const unseenCounts = await db.resolvers.queryuser.getParticipantUnseenCounts({
            query_id: message.query_id
        });
        // Filter the results to only counts involving active clients
        const withClient = unseenCounts.rows.filter(
            (row) => connectedClients.indexOf(row.user_id > -1)
        );
        if (withClient.length > 0) {
            // Send a message to each user
            withClient.forEach((row) => {
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
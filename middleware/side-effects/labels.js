const WebsocketServer = require('../../classes/WebsocketServer');
const db = require('../../../ems-db');

const labels = {
    // Inform all clients, apart from the initiator, that
    // a label has been created or updated
    labelToClients: (req, res, next) => {
        const methodToAction = {
            POST: 'create',
            PUT: 'update',
            DELETE: 'delete'
        };
        const { label } = req.wsData;
        // Send the new message via the websocket
        WebsocketServer.excludeInitiatorMessage({
            initiator: req.user.id,
            subject: 'label',
            action: methodToAction[req.method],
            payload: label
        });
        next();
    },
    // Send updated label counts to anyone who is connected
    // and can see the given query
    labelCountsToClients: async (req, res, next) => {
        // Get the user objects associated with connected clients
        const activeClientIds = WebsocketServer.connectedClientUserIds();
        const activeClients = await db.resolvers.users.allUsers(
            { query: { user_ids: activeClientIds.join('_') } }
        );

        activeClients.rows.forEach((client) => {
            // We don't await here because these can be sent async
            db.resolvers.labels.labelCounts(
                { user: client }
            )
                .then((labelCounts) => {
                    WebsocketServer.onlyInitiatorMessage({
                        initiator: client.id,
                        subject: 'labelCount',
                        action: 'update',
                        payload: labelCounts
                    });
                })
                .catch((err) => err);
        });
        next();
    }
};

module.exports = labels;
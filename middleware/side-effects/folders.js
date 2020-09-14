const WebsocketServer = require('../../classes/WebsocketServer');
const db = require('../../../ems-db');

const folders = {
    // Send updated folder counts to anyone who is connected
    // and can see the given query
    folderCountsToClients: async (req, res, next) => {
        // Get the user objects associated with connected clients
        const activeClientIds = WebsocketServer.connectedClientUserIds();
        const activeClients = await db.resolvers.users.allUsers({
            query: { user_ids: activeClientIds.join('_') }
        });

        activeClients.rows.forEach((client) => {
            // We don't await here because these can be sent async
            db.resolvers.folders
                .folderCounts({ user: client })
                .then((folderCounts) => {
                    WebsocketServer.onlyInitiatorMessage({
                        initiator: client.id,
                        subject: 'folderCount',
                        action: 'update',
                        payload: folderCounts
                    });
                })
                .catch((err) => err);
        });
        next();
    }
};

module.exports = folders;

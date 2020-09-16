const WebsocketServer = require('../../classes/WebsocketServer');
const db = require('../../../ems-db');

const folders = {
    // Send updated folder counts to any staff connected
    folderCountsToClients: async (req, res, next) => {
        const activeClientIds = WebsocketServer.connectedClientUserIds();
        // Get the user objects associated with all staff
        const allStaff = await db.resolvers.users.allStaff();
        allStaff.rows.forEach((staff) => {
            if (activeClientIds.indexOf(staff.id) > -1) {
                // We don't await here because these can be sent async
                db.resolvers.folders
                    .folderCounts({ user: staff })
                    .then((folderCounts) => {
                        WebsocketServer.onlyInitiatorMessage({
                            initiator: staff.id,
                            subject: 'folderCount',
                            action: 'update',
                            payload: folderCounts
                        });
                    })
                    .catch((err) => err);
            }
        });
        next();
    }
};

module.exports = folders;

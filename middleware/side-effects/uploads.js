const WebsocketServer = require('../../classes/WebsocketServer');
const db = require('../../../ems-db');

const uploads = {
    // Inform all clients, apart from the initiator, that
    // one or more uploads have been sent
    newUploadToClients: async (req, res, next) => {
        const { uploads } = req.wsData;
        // Find out who should receive this message
        const allAssociated = await db.resolvers.queries.associated(
            [uploads[0].query_id]
        );
        const recipients = allAssociated.filter(
            (associated) => associated !== req.user.id
        );
        // Send the new message via the websocket
        WebsocketServer.recipientsMessage({
            recipients,
            initiator: uploads[0].creator_id,
            subject: 'upload',
            action: 'create',
            payload: uploads
        });
        next();
    }
};

module.exports = uploads;

const WebsocketServer = require('../../classes/WebsocketServer');

const uploads = {
    // Inform all clients, apart from the initiator, that
    // one or more uploads have been sent
    newUploadToClients: (req, res, next) => {
        const { uploads } = req.wsData;
        // Send the new message via the websocket
        WebsocketServer.excludeInitiatorMessage({
            initiator: uploads[0].creator_id,
            subject: 'upload',
            action: 'create',
            payload: uploads
        });
        next();
    }
};

module.exports = uploads;

const WebsocketServer = require('../../classes/WebsocketServer');

const messages = {
    // Inform all clients, apart from the initiator, that
    // a message has been created or updated
    newMessageToClients: (req, res, next) => {
        const socketAction = req.method === 'POST' ? 'create' : 'update';
        const { message } = req.wsData;
        // Send the new message via the websocket
        WebsocketServer.excludeInitiatorMessage({
            initiator: message.creator_id,
            subject: 'message',
            action: socketAction,
            payload: message
        });
        next();
    },
    // Inform all clients, apart from the initiator, that
    // a message has been deleted
    deletedMessageToClients: (req, res, next) => {
        const { message } = req.wsData;
        // Send the deleted message details via the websocket
        WebsocketServer.excludeInitiatorMessage({
            initiator: message.creator_id,
            subject: 'message',
            action: 'delete',
            payload: message
        });
        next();
    }
};

module.exports = messages;

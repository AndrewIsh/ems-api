const WebsocketServer = require('../../classes/WebsocketServer');

const db = require('../../../ems-db');

const messages = {
    // Inform all participants, apart from the initiator, that
    // a message has been created or updated
    newMessageToClients: async (req, res, next) => {
        const socketAction = req.method === 'POST' ? 'create' : 'update';
        const { message } = req.wsData;
        // Find out who should receive this message
        const allAssociated = await db.resolvers.queries.associated(
            [message.query_id]
        );
        const recipients = allAssociated.filter(
            (associated) => associated !== req.user.id
        );
        // Send the new message via the websocket
        WebsocketServer.recipientsMessage({
            recipients,
            initiator: message.creator_id,
            subject: 'message',
            action: socketAction,
            payload: message
        });
        next();
    },
    // Inform all participants, apart from the initiator, that
    // a message has been deleted
    deletedMessageToClients: async (req, res, next) => {
        const { message } = req.wsData;
        // Find out who should receive this message
        const allAssociated = await db.resolvers.queries.associated(
            [message.query_id]
        );
        const recipients = allAssociated.filter(
            (associated) => associated !== req.user.id
        );
        // Send the deleted message details via the websocket
        WebsocketServer.recipientsMessage({
            recipients,
            initiator: message.creator_id,
            subject: 'message',
            action: 'delete',
            payload: message
        });
        next();
    }
};

module.exports = messages;

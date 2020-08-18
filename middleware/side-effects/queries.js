const WebsocketServer = require('../../helpers/WebsocketServer');
const db = require('../../../ems-db');
const helpers = require('../../helpers/queries');

const queries = {
    // Inform all clients that a query has been updated
    updateQuery: async (req, res, next) => {
        const { query_id } = req.wsData;
        const query = await db.resolvers.queries.getQuery(
            { params: { id: query_id } }
        );
        const toSend = await helpers.addEmbeds(query);
        // Send the updated query via the websocket
        WebsocketServer.broadcastMessage({
            subject: 'query',
            action: 'update',
            payload: toSend
        });
        next();
    }

};

module.exports = queries;
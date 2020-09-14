const WebSocket = require('ws');
const { verifyJwt } = require('../helpers/token');

class WebsocketServer {
    init() {
        const { WS_PORT } = process.env;

        // Initialise the server
        this.socketServer = new WebSocket.Server({ port: WS_PORT });
        console.log(`Websocket server running on port ${WS_PORT}`);
        this.handleConnectDisconnect();
    }

    handleConnectDisconnect() {
        // Handle connection and disconnection of client
        this.socketServer.on('connection', (socketClient) => {
            // Ensure the connection contains a valid JWT. We're
            // bastardising the 'Sec-WebSocket-Protocol' header here
            // to pass a JWT
            const jwt = socketClient.protocol;
            try {
                // If we've got a valid JWT
                const { sub } = verifyJwt(jwt);
                // Get the user ID in the payload and add it
                // to the client object, this will enable us to
                // target messages
                socketClient.userId = sub;
                console.log(
                    `WS client connected, ${this.socketServer.clients.size} clients connected`
                );
                socketClient.on('close', () => {
                    console.log(
                        `WS client disconnected, ${this.socketServer.clients.size} clients connected`
                    );
                });
            } catch (err) {
                console.log('WS client unauthorised, closing connection');
                socketClient.close();
            }
        });
    }
    // Return an array of all connected client user IDs
    connectedClientUserIds() {
        const ids = [];
        this.socketServer.clients.forEach((client) => ids.push(client.userId));
        return ids;
    }
    // Send a message to all available clients
    // initiator: the ID of the user that initiated the action (if available)
    // subject: The subject of the operation that the action was on
    //          (e.g.message)
    // action: The action that was performed on the subject (e.g. update)
    // payload: Any payload resulting from the action on the subject
    //          (e.g.updated message)
    broadcastMessage({ initiator, subject, action, payload }) {
        this.socketServer.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(
                    JSON.stringify({ initiator, subject, action, payload })
                );
            }
        });
    }
    // Send a message to all client *except* the one that initiated
    // the action
    excludeInitiatorMessage({ initiator, subject, action, payload }) {
        this.socketServer.clients.forEach((client) => {
            if (
                parseInt(client.userId) !== parseInt(initiator) &&
                client.readyState === WebSocket.OPEN
            ) {
                client.send(
                    JSON.stringify({ initiator, subject, action, payload })
                );
            }
        });
    }
    // Send a message to only the client that initiated the action
    onlyInitiatorMessage({ initiator, subject, action, payload }) {
        const BreakException = {};
        try {
            this.socketServer.clients.forEach((client) => {
                if (
                    parseInt(client.userId) === parseInt(initiator) &&
                    client.readyState === WebSocket.OPEN
                ) {
                    client.send(
                        JSON.stringify({ initiator, subject, action, payload })
                    );
                    // Found our client, exit the forEach
                    throw BreakException;
                }
            });
        } catch (e) {
            if (e !== BreakException) throw e;
        }
    }
}

const singleton = new WebsocketServer();

module.exports = singleton;

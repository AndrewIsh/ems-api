const db = require('../ems-db');
const ems = require('./app');
const WebsocketServer = require('./classes/WebsocketServer');

// Make sure the database is fully up to date before
// starting the API
db.update()
    .then(() => {
        // Start the API
        const { API_PORT } = process.env;
        // init() returns a promise that resolves to our app
        ems.init().then((app) => {
            app.listen(API_PORT, () => {
                console.log(`Server running on port ${API_PORT}`);
            });
            WebsocketServer.init(app);
        });
    })
    .error((e) => console.log(e));

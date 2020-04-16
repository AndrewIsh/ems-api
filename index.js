const db = require('../ems-db');
const ems = require('./app');

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
        });
    })
    .error((e) => console.log(e));

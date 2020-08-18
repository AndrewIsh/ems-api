const messagesSideEffects = require('./messages');
const queriesSideEffects = require('./queries');
const uploadsSideEffects = require('./uploads');

// Side effects that needs to happen when certain API
// routes are called

module.exports = {
    messagesSideEffects,
    queriesSideEffects,
    uploadsSideEffects
};
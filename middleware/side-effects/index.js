const messagesSideEffects = require('./messages');
const queriesSideEffects = require('./queries');
const foldersSideEffects = require('./folders');
const uploadsSideEffects = require('./uploads');
const labelsSideEffects = require('./labels');

// Side effects that needs to happen when certain API
// routes are called

module.exports = {
    messagesSideEffects,
    queriesSideEffects,
    foldersSideEffects,
    uploadsSideEffects,
    labelsSideEffects
};

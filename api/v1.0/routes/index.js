const queryRouter = require('./queries');
const messageRouter = require('./messages');
const folderRouter = require('./folders');
const labelRouter = require('./labels');
const userRouter = require('./users');

module.exports = {
    queryRouter,
    messageRouter,
    folderRouter,
    labelRouter,
    userRouter
};

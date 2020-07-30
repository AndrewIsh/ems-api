const queryRouter = require('./queries');
const messageRouter = require('./messages');
const folderRouter = require('./folders');
const labelRouter = require('./labels');
const userRouter = require('./users');
const roleRouter = require('./roles');
const uploadRouter = require('./uploads');
const tokenRouter = require('./token');
const activeUserRouter = require('./activeuser');
const authTypesRouter = require('./authtypes');

module.exports = {
    queryRouter,
    messageRouter,
    folderRouter,
    labelRouter,
    userRouter,
    roleRouter,
    uploadRouter,
    tokenRouter,
    activeUserRouter,
    authTypesRouter
};

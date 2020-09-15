const router = require('express').Router();

const { postJwtAuth } = require('../../helpers/token');

const {
    queryRouter,
    messageRouter,
    folderRouter,
    labelRouter,
    userRouter,
    roleRouter,
    uploadRouter,
    tokenRouter,
    activeUserRouter,
    authTypesRouter,
    queryUserRouter
} = require('./routes');

// Routes to be registered with the router
//
// Routes that require a JWT (and therefore need
// handling of the case where the JWT validation failed)
// 
// ** NOTE: /token definitions are not here, we define them in
// their router because we need different behaviour according
// to method
const withJwt = [
    { path: 'queries', router: queryRouter },
    { path: 'messages', router: messageRouter },
    { path: 'folders', router: folderRouter },
    { path: 'labels', router: labelRouter },
    { path: 'users', router: userRouter },
    { path: 'roles', router: roleRouter },
    { path: 'upload', router: uploadRouter },
    { path: 'activeuser', router: activeUserRouter },
    { path: 'queryuser', router: queryUserRouter }
];

// Routes that don't require a JWT
const withoutJwt = [
    { path: 'token', router: tokenRouter },
    { path: 'authtypes', router: authTypesRouter }
];

withJwt.forEach((aRoute) =>
    router.use(
        `/${aRoute.path}`,
        (req, res, next) => postJwtAuth(req, res, next),
        aRoute.router
    )
);

withoutJwt.forEach((uRoute) => router.use(`/${uRoute.path}`, uRoute.router));

module.exports = router;

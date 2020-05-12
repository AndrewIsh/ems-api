const router = require('express').Router();

const {
    queryRouter,
    messageRouter,
    folderRouter,
    labelRouter,
    userRouter,
    roleRouter
} = require('./routes');

router.use('/queries', queryRouter);
router.use('/messages', messageRouter);
router.use('/folders', folderRouter);
router.use('/labels', labelRouter);
router.use('/users', userRouter);
router.use('/roles', roleRouter);

module.exports = router;

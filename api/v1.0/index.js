const router = require('express').Router();

const {
    queryRouter,
    messageRouter,
    folderRouter,
    labelRouter
} = require('./routes');

router.use('/queries', queryRouter);
router.use('/messages', messageRouter);
router.use('/folders', folderRouter);
router.use('/labels', labelRouter);

module.exports = router;

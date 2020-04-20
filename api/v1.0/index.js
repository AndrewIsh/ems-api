const router = require('express').Router();

const { queryRouter, messageRouter, folderRouter } = require('./routes');

router.use('/queries', queryRouter);
router.use('/messages', messageRouter);
router.use('/folders', folderRouter);

module.exports = router;

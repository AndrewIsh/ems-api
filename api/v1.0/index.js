const router = require('express').Router();

const { queryRouter, messageRouter } = require('./routes');

router.use('/queries', queryRouter);
router.use('/messages', messageRouter);

module.exports = router;

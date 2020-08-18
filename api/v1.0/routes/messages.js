const router = require('express').Router();

const messages = require('../../../controllers/messages');

const {
    messagesSideEffects,
    queriesSideEffects
} = require('../../../middleware/side-effects');

router.get('/', messages.getMessages);
router.post(
    '/',
    messages.upsertMessage,
    messagesSideEffects.sendMessage,
    queriesSideEffects.updateQuery
);
router.put(
    '/:id',
    messages.upsertMessage,
    messagesSideEffects.sendMessage,
    queriesSideEffects.updateQuery
);
router.delete('/:id',
    messages.deleteMessage,
    messagesSideEffects.deleteMessage,
    queriesSideEffects.updateQuery
);

module.exports = router;

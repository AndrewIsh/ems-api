const router = require('express').Router();

const messages = require('../../../controllers/messages');
const { checkIsInRole } = require('../../../auth/utils');

const {
    messagesSideEffects,
    queriesSideEffects,
} = require('../../../middleware/side-effects');

router.get('/', checkIsInRole('STAFF', 'CUSTOMER'), messages.getMessages);
router.post(
    '/',
    checkIsInRole('STAFF', 'CUSTOMER'),
    messages.upsertMessage,
    messagesSideEffects.sendMessage,
    queriesSideEffects.updateQuery,
    queriesSideEffects.updateQueryUnseenCounts
);
router.put(
    '/:id',
    checkIsInRole('STAFF', 'CUSTOMER'),
    messages.upsertMessage,
    messagesSideEffects.sendMessage,
    queriesSideEffects.updateQuery
);
router.delete('/:id',
    checkIsInRole('STAFF', 'CUSTOMER'),
    messages.deleteMessage,
    messagesSideEffects.deleteMessage,
    queriesSideEffects.updateQuery,
    queriesSideEffects.updateQueryUnseenCounts
);

module.exports = router;

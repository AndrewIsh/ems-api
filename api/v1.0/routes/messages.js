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
    messagesSideEffects.newMessageToClients,
    queriesSideEffects.updatedQueryToClients,
    queriesSideEffects.queryUnseenCountsToClients
);
router.put(
    '/:id',
    checkIsInRole('STAFF', 'CUSTOMER'),
    messages.upsertMessage,
    messagesSideEffects.newMessageToClients,
    queriesSideEffects.updatedQueryToClients
);
router.delete('/:id',
    checkIsInRole('STAFF', 'CUSTOMER'),
    messages.deleteMessage,
    messagesSideEffects.deletedMessageToClients,
    queriesSideEffects.updatedQueryToClients,
    queriesSideEffects.queryUnseenCountsToClients
);

module.exports = router;

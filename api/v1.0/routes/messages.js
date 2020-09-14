const router = require('express').Router();

const messages = require('../../../controllers/messages');
const { checkIsInRole } = require('../../../auth/utils');

const {
    messagesSideEffects,
    queriesSideEffects,
    foldersSideEffects
} = require('../../../middleware/side-effects');

router.get('/', checkIsInRole('STAFF', 'CUSTOMER'), messages.getMessages);
router.post(
    '/',
    checkIsInRole('STAFF', 'CUSTOMER'),
    messages.upsertMessage,
    messagesSideEffects.newMessageToClients,
    queriesSideEffects.updatedQueriesToClients,
    queriesSideEffects.queryUnseenCountsToClients,
    foldersSideEffects.folderCountsToClients
);
router.put(
    '/:id',
    checkIsInRole('STAFF', 'CUSTOMER'),
    messages.upsertMessage,
    messagesSideEffects.newMessageToClients,
    queriesSideEffects.updatedQueriesToClients,
    foldersSideEffects.folderCountsToClients
);
router.delete(
    '/:id',
    checkIsInRole('STAFF', 'CUSTOMER'),
    messages.deleteMessage,
    messagesSideEffects.deletedMessageToClients,
    queriesSideEffects.updatedQueriesToClients,
    queriesSideEffects.queryUnseenCountsToClients,
    foldersSideEffects.folderCountsToClients
);

module.exports = router;

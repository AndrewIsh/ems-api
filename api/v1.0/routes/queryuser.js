const router = require('express').Router();

const { checkIsInRole } = require('../../../auth/utils');
const queryuser = require('../../../controllers/queryuser');
const {
    queriesSideEffects,
    foldersSideEffects
} = require('../../../middleware/side-effects');

router.put(
    '/:query_id/user/:user_id',
    checkIsInRole('STAFF', 'CUSTOMER'),
    queryuser.updateMostRecentSeen,
    queriesSideEffects.userUnseenCountsToClient,
    foldersSideEffects.folderCountsToClients
);

module.exports = router;

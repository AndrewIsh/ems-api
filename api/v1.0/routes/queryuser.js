const router = require('express').Router();

const { checkIsInRole } = require('../../../auth/utils');
const queryuser = require('../../../controllers/queryuser');
const {
    queriesSideEffects,
} = require('../../../middleware/side-effects');

router.put(
    '/:query_id/user/:user_id',
    checkIsInRole('STAFF', 'CUSTOMER'),
    queryuser.updateMostRecentSeen,
    queriesSideEffects.userUnseenCountsToClient
);

module.exports = router;
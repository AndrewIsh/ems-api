const router = require('express').Router();

const uploads = require('../../../controllers/uploads');
const { checkIsInRole } = require('../../../auth/utils');

const {
    uploadsSideEffects,
    queriesSideEffects,
    foldersSideEffects
} = require('../../../middleware/side-effects');

router.post(
    '/',
    checkIsInRole('STAFF', 'CUSTOMER'),
    uploads.handleUpload,
    uploadsSideEffects.newUploadToClients,
    queriesSideEffects.updatedQueriesToClients,
    queriesSideEffects.queryUnseenCountsToClients,
    foldersSideEffects.folderCountsToClients
);

module.exports = router;

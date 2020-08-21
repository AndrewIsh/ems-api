const router = require('express').Router();

const uploads = require('../../../controllers/uploads');
const { checkIsInRole } = require('../../../auth/utils');

const {
    uploadsSideEffects,
    queriesSideEffects
} = require('../../../middleware/side-effects');

router.post(
    '/',
    checkIsInRole('STAFF', 'CUSTOMER'),
    uploads.handleUpload,
    uploadsSideEffects.sendUploads,
    queriesSideEffects.updateQuery
);

module.exports = router;

const router = require('express').Router();

const uploads = require('../../../controllers/uploads');

const {
    uploadsSideEffects,
    queriesSideEffects
} = require('../../../middleware/side-effects');

router.post(
    '/',
    uploads.handleUpload,
    uploadsSideEffects.sendUploads,
    queriesSideEffects.updateQuery
);

module.exports = router;

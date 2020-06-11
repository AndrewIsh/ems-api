const router = require('express').Router();

const uploads = require('../../../controllers/uploads');

router.post('/', uploads.handleUpload);

module.exports = router;

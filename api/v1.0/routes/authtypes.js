const router = require('express').Router();

const authtypes = require('../../../controllers/authtypes');

router.get('/', authtypes.getAuthtypes);

module.exports = router;
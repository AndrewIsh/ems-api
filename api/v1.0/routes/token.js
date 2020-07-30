const router = require('express').Router();

const token = require('../../../controllers/token');

router.get('/', token.doRefresh);
router.delete('/', token.delete);

module.exports = router;

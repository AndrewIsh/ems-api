const router = require('express').Router();

const token = require('../../../controllers/token');
const { checkIsInRole } = require('../../../auth/utils');

router.get('/', token.doRefresh);
router.delete('/', checkIsInRole('STAFF', 'CUSTOMER'), token.delete);

module.exports = router;

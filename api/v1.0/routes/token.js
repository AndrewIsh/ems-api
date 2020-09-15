const router = require('express').Router();

const { postJwtAuth } = require('../../../helpers/token');
const token = require('../../../controllers/token');
const { checkIsInRole } = require('../../../auth/utils');

router.get('/', token.doRefresh);
router.delete(
    '/',
    (req, res, next) => postJwtAuth(req, res, next),
    checkIsInRole('STAFF', 'CUSTOMER'),
    token.delete
);

module.exports = router;

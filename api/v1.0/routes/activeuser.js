const router = require('express').Router();

const activeUser = require('../../../controllers/activeuser');

router.get('/', activeUser.getActiveUser);

module.exports = router;

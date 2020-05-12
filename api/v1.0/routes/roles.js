const router = require('express').Router();

const roles = require('../../../controllers/roles');

router.get('/', roles.getRoles);

module.exports = router;

const router = require('express').Router();

const v1Router = require('./v1.0');

router.use('/v1.0', v1Router);

module.exports = router;

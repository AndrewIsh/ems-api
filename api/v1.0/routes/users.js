const router = require('express').Router();

const users = require('../../../controllers/users');

router.get('/', users.getUsers);
router.get('/:id', users.getUser);
router.post('/', users.upsertUser);
router.put('/:id', users.upsertUser);
router.delete('/:id', users.deleteUser);

module.exports = router;

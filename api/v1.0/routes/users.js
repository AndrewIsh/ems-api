const router = require('express').Router();

const users = require('../../../controllers/users');
const { checkIsInRole } = require('../../../auth/utils');

router.get('/', checkIsInRole('STAFF', 'CUSTOMER'), users.getUsers);
router.get('/:id', checkIsInRole('STAFF', 'CUSTOMER'), users.getUser);
/* Not currently required
router.post('/', checkIsInRole('STAFF'), users.upsertUser);
router.put('/:id', checkIsInRole('STAFF'), users.upsertUser);
router.delete('/:id', checkIsInRole('STAFF'), users.deleteUser);
*/

module.exports = router;

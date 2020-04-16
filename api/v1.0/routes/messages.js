const router = require('express').Router();

const messages = require('../../../controllers/messages');

router.get('/', messages.getMessages);
router.post('/', messages.upsertMessage);
router.put('/:id', messages.upsertMessage);
router.delete('/:id', messages.deleteMessage);

module.exports = router;

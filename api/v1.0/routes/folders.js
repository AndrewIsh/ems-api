const router = require('express').Router();

const folders = require('../../../controllers/folders');

router.get('/', folders.getFolders);
router.post('/', folders.upsertFolder);
router.put('/:id', folders.upsertFolder);
router.delete('/:id', folders.deleteFolder);

module.exports = router;

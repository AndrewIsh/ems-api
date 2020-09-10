const router = require('express').Router();

const folders = require('../../../controllers/folders');
const { checkIsInRole } = require('../../../auth/utils');
const { foldersSideEffects } = require('../../../middleware/side-effects');

router.get(
    '/',
    checkIsInRole('STAFF'),
    folders.getFolders,
    foldersSideEffects.folderCountsToClients
);
router.post('/', checkIsInRole('STAFF'), folders.upsertFolder);
router.put('/:id', checkIsInRole('STAFF'), folders.upsertFolder);
router.delete('/:id', checkIsInRole('STAFF'), folders.deleteFolder);

module.exports = router;

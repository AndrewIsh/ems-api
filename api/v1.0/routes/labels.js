const router = require('express').Router();

const labels = require('../../../controllers/labels');
const { checkIsInRole } = require('../../../auth/utils');

router.get('/', checkIsInRole('STAFF'), labels.getLabels);
router.post('/', checkIsInRole('STAFF'), labels.upsertLabel);
router.put('/:id', checkIsInRole('STAFF'), labels.upsertLabel);
router.delete('/:id', checkIsInRole('STAFF'), labels.deleteLabel);

module.exports = router;

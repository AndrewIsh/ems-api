const router = require('express').Router();

const labels = require('../../../controllers/labels');

router.get('/', labels.getLabels);
router.post('/', labels.upsertLabel);
router.put('/:id', labels.upsertLabel);
router.delete('/:id', labels.deleteLabel);

module.exports = router;

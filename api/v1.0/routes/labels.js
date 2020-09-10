const router = require('express').Router();

const labels = require('../../../controllers/labels');
const { checkIsInRole } = require('../../../auth/utils');
const { labelsSideEffects } = require('../../../middleware/side-effects');

router.get(
    '/',
    checkIsInRole('STAFF'),
    labels.getLabels,
    labelsSideEffects.labelCountsToClients
);
router.post(
    '/',
    checkIsInRole('STAFF'),
    labels.upsertLabel,
    labelsSideEffects.labelToClients
);
router.put(
    '/:id',
    checkIsInRole('STAFF'),
    labels.upsertLabel,
    labelsSideEffects.labelToClients
);
router.delete(
    '/:id',
    checkIsInRole('STAFF'),
    labels.deleteLabel,
    labelsSideEffects.labelToClients
);

module.exports = router;

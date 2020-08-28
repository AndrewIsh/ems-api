const router = require('express').Router();

const queries = require('../../../controllers/queries');
const querylabel = require('../../../controllers/querylabel');
const { checkIsInRole } = require('../../../auth/utils');
const { queriesSideEffects } = require('../../../middleware/side-effects');

router.get(
    '/',
    checkIsInRole('STAFF', 'CUSTOMER'),
    queries.getQueries,
    queriesSideEffects.userUnseenCountsToClient,
    queriesSideEffects.mostRecentSeenToClient
);
router.get('/:id', checkIsInRole('STAFF', 'CUSTOMER'), queries.getQuery);
router.post('/', checkIsInRole('STAFF', 'CUSTOMER'), queries.upsertQuery);
router.put('/', checkIsInRole('STAFF'), queries.updateBulk);
router.put('/:id', checkIsInRole('STAFF'), queries.upsertQuery);
router.delete('/:id', checkIsInRole('STAFF'), queries.deleteQuery);
// POST and PUT use the same controller, albeit with a different 'action'
// parameter, so we pass that here
router.post('/:query_id/label/:label_id', checkIsInRole('STAFF'), (req, res, next) =>
    querylabel.addRemove(req, res, next, 'addLabelToQuery'));
router.delete('/:query_id/label/:label_id', checkIsInRole('STAFF'), (req, res, next) =>
    querylabel.addRemove(req, res, next, 'removeLabelFromQuery'));

module.exports = router;

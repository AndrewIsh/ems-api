const router = require('express').Router();

const queries = require('../../../controllers/queries');
const querylabel = require('../../../controllers/querylabel');

router.get('/', queries.getQueries);
router.get('/:id', queries.getQuery);
router.post('/', queries.upsertQuery);
router.put('/:id', queries.upsertQuery);
router.delete('/:id', queries.deleteQuery);
router.post('/:query_id/label/:label_id', querylabel.addLabelToQuery);
router.delete('/:query_id/label/:label_id', querylabel.removeLabelFromQuery);

module.exports = router;

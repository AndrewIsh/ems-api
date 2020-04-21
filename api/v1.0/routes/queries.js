const router = require('express').Router();

const queries = require('../../../controllers/queries');
const querylabel = require('../../../controllers/querylabel');
const queryuser = require('../../../controllers/queryuser');

router.get('/', queries.getQueries);
router.get('/:id', queries.getQuery);
router.post('/', queries.upsertQuery);
router.put('/:id', queries.upsertQuery);
router.delete('/:id', queries.deleteQuery);
router.post('/:query_id/label/:label_id', querylabel.addLabelToQuery);
router.delete('/:query_id/label/:label_id', querylabel.removeLabelFromQuery);
router.post('/:query_id/user/:user_id', queryuser.addUserToQuery);
router.put('/:query_id/user/:user_id', queryuser.updateMostRecentSeen);

module.exports = router;

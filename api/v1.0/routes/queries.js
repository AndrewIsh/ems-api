const router = require('express').Router();

const queries = require('../../../controllers/queries');
const querylabel = require('../../../controllers/querylabel');
const queryuser = require('../../../controllers/queryuser');

router.get('/', queries.getQueries);
router.get('/:id', queries.getQuery);
router.post('/', queries.upsertQuery);
router.put('/', queries.updateBulk);
router.put('/:id', queries.upsertQuery);
router.delete('/:id', queries.deleteQuery);
// POST and PUT use the same controller, albeit with a different 'action'
// parameter, so we pass that here
router.post('/:query_id/label/:label_id', (req, res, next) =>
    querylabel.addRemove(req, res, next, 'addLabelToQuery'));
router.delete('/:query_id/label/:label_id', (req, res, next) =>
    querylabel.addRemove(req, res, next, 'removeLabelFromQuery'));
router.post('/:query_id/user/:user_id', queryuser.addUserToQuery);
router.put('/:query_id/user/:user_id', queryuser.updateMostRecentSeen);

module.exports = router;

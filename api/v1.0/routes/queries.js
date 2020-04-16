const router = require('express').Router();

const queries = require('../../../controllers/queries');

router.get('/', queries.getQueries);
router.get('/:id', queries.getQuery);
router.post('/', queries.upsertQuery);
router.put('/:id', queries.upsertQuery);
router.delete('/:id', queries.deleteQuery);

module.exports = router;

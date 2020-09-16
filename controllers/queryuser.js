const db = require('../../ems-db');

const queryuser = {
    updateMostRecentSeen: (req, res, next) => {
        // We should only be able to update most recent seen
        // for the requesting user
        if (req.user.id !== parseInt(req.params.user_id)) {
            res.status(404);
            return; 
        }
        db.resolvers.queryuser
            .updateMostRecentSeen(req)
            .then((result) => {
                if (result.rowCount === 0) {
                    res.status(404);
                    res.send();
                    next();
                } else if (result.rowCount === 1) {
                    res.status(200);
                    req.wsData = { query_ids: [result.rows[0].query_id] };
                    res.json(result.rows[0]);
                    next();
                } else {
                    res.status(500);
                    res.send();
                    next();
                }
            })
            .catch((err) => next(err));
    }
};

module.exports = queryuser;

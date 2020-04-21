const db = require('../../ems-db');

const querylabel = {
    addLabelToQuery: (req, res, next) =>
        db.resolvers.querylabel
            .addLabelToQuery(req)
            .then((result) => {
                if (result.rowCount === 1) {
                    res.status(201);
                    res.json(result.rows[0]);
                    next();
                } else {
                    res.status(500);
                    res.send();
                    next();
                }
            })
            .catch((err) => next(err)),
    removeLabelFromQuery: (req, res, next) =>
        db.resolvers.querylabel
            .removeLabelFromQuery(req)
            .then((result) => {
                if (result.rowCount === 0) {
                    res.status(404);
                    res.send();
                    next();
                } else if (result.rowCount === 1) {
                    res.status(204);
                    res.json({});
                    next();
                } else {
                    res.status(500);
                    res.send();
                    next();
                }
            })
            .catch((err) => next(err))
};

module.exports = querylabel;

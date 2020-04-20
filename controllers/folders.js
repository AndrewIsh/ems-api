const db = require('../../ems-db');

const folders = {
    getFolders: (req, res, next) =>
        db.resolvers.folders
            .allFolders(req)
            .then((result) => {
                res.json(result.rows);
                next();
            })
            .catch((err) => {
                next(err);
            }),
    upsertFolder: (req, res, next) =>
        db.resolvers.folders
            .upsertFolder(req)
            .then((result) => {
                if (result.rowCount === 0) {
                    res.status(404);
                    res.send();
                    next();
                } else {
                    res.status(req.method === 'POST' ? 201 : 200);
                    res.json(result.rows[0]);
                    next();
                }
            })
            .catch((err) => next(err)),
    deleteFolder: (req, res, next) =>
        db.resolvers.folders
            .deleteFolder(req)
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

module.exports = folders;

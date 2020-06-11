const fs = require('fs');

const db = require('../../ems-db');

const messages = {
    getMessages: async (req, res, next) =>
        db.resolvers.messages
            .allMessages(req)
            .then((result) => {
                res.status(200);
                res.json(result.rows);
                next();
            })
            .catch(() => {
                res.status(500);
                res.send();
                next();
            }),
    upsertMessage: (req, res, next) =>
        // TODO: Ensure the message being edited belongs to the user
        db.resolvers.messages
            .upsertMessage(req)
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
    deleteMessage: (req, res, next) =>
        // TODO: Ensure the message being deleted belongs to the user
        //
        // First get the message that is about to be deleted and
        // check if it has a file attachment
        db.resolvers.messages.getMessage(req)
            .then((toDelete) => {
                if (toDelete.rowCount === 0) {
                    res.status(404);
                    res.send();
                    next();
                } else if (toDelete.rowCount === 1) {
                    // Populate the filename to be deleted
                    const delFilename = toDelete.rows[0].filename ?
                        toDelete.rows[0].filename :
                        null;
                    return db.resolvers.messages
                        .deleteMessage(req)
                        .then(() => {
                            // We need to delete any file attachment associated with
                            // this message
                            if (delFilename) {
                                fs.unlinkSync(`${process.env.UPLOADS_DIR}/${delFilename}`);
                            }
                            res.status(204);
                            res.json({});
                            next();
                        })
                        .catch((err) => next(err));
                } else {
                    res.status(500);
                    res.send();
                    next();
                }
            })
            .catch((err) => next(err))
};

module.exports = messages;

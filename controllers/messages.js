const db = require('../../ems-db');

const messages = {
    getMessages: async (req, res, next) => {
        try {
            // Wait for both the messages query and initiator
            // query to complete, so we can form our response
            const [messages, initiator ] = await Promise.all([
                db.resolvers.messages
                    .allMessages(req),
                db.resolvers.queries
                    .initiator(req)
            ]);
            const response = {
                messages: messages.rows,
                initiator: initiator.rows.length > 0 ? initiator.rows[0].creator_id : null
            };
            res.status(200);
            res.json(response);
            next();
        } catch (err) {
            res.status(500);
            res.send();
            next();
        }
    },
    upsertMessage: (req, res, next) =>
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
        db.resolvers.messages
            .deleteMessage(req)
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

module.exports = messages;

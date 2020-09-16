const db = require('../../ems-db');

const messages = {
    userIsCreator: async (req) => {
        const message = await db.resolvers.messages.getMessage(req);
        return message.rows.length === 1 ?
            message.rows[0].creator_id === req.user.id :
            false;
    },
    userCanCreate: async (req) => {
        const associated = await db.resolvers.queries.associated(
            [req.body.query_id]
        );
        return req.body.creator_id === req.user.id &&
            associated.indexOf(req.user.id) > -1;
    }
};

module.exports = messages;

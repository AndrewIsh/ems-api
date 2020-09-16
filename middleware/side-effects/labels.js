const WebsocketServer = require('../../classes/WebsocketServer');
const db = require('../../../ems-db');

const labels = {
    // Inform all staff, apart from the initiator, that
    // a label has been created or updated
    labelToClients: async (req, res, next) => {
        const methodToAction = {
            POST: 'create',
            PUT: 'update',
            DELETE: 'delete'
        };
        const { label } = req.wsData;
        // Get the recipients
        const allStaff = await db.resolvers.users.allStaff();
        const recipients = allStaff.rows
            .filter((staff) => staff.id !== req.user.id)
            .map((toMap) => toMap.id);

        WebsocketServer.recipientsMessage({
            recipients,
            initiator: req.user.id,
            subject: 'label',
            action: methodToAction[req.method],
            payload: label
        });
        next();
    },
    // Send updated label counts to all staff
    labelCountsToClients: async (req, res, next) => {
        // Get the recipients
        const allStaff = await db.resolvers.users.allStaff();

        // Iterate through each recipient
        allStaff.rows.forEach((recipient) => {
            // Get this recipient's label counts
            db.resolvers.labels
                .labelCounts({ user: recipient })
                .then((labelCounts) => {
                    WebsocketServer.onlyInitiatorMessage({
                        initiator: recipient.id,
                        subject: 'labelCount',
                        action: 'update',
                        payload: labelCounts
                    });
                })
                .catch((err) => err);
        });
        next();
    }
};

module.exports = labels;

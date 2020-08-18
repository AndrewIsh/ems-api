const db = require('../../ems-db');

const uploads = {
    handleUpload: async (req, res, next) => {
        try {
            if (!req.files) {
                res.status(500);
                res.send({
                    error: 'No files uploaded'
                });
            } else {
                const summary = [];
                const dbUpdates = [];
                req.files.forEach(file => {
                    summary.push({
                        name: file.originalname
                    });
                    dbUpdates.push(
                        db.resolvers.messages.insertUpload({
                            filename: file.filename,
                            originalName: file.originalname,
                            queryId: req.body.queryId,
                            userId: req.body.userId
                        })
                    );
                });
                const updated = await Promise.all(dbUpdates);
                const toSend = updated.map(update => update.rows[0]);
                req.wsData = toSend;
                res.send(toSend)
                next();
            }
        } catch (error) {
            res.status(500);
            res.send({
                error
            });

        }
    }
};
module.exports = uploads;

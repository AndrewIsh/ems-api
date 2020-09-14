module.exports = {
    // Retain next, the 4 arguments indicates to
    // express that this is an error handler
    // eslint-disable-next-line no-unused-vars
    errorFallback: (err, req, res, next) => {
        res.status(err.status || 500);
        res.json({ error: err, message: err.message });
    }
};

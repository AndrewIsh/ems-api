module.exports = {
    errorFallback: (err, req, res, next) => {
        res.status(err.status || 500);
        res.json({ error: err, message: err.message });
    }
};

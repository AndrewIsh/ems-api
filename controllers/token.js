const { doRefresh, deleteRefresh } = require('../helpers/token');

const token = {
    doRefresh,
    delete: (req, res, next) => {
        // Get the refresh token, if supplied
        const refresh = req.cookies.refresh_token;
        if (!refresh) {
            res.status(404);
            next();
        }
        // Remove the refresh token from the cache
        deleteRefresh(refresh);
        res.status(204);
        res.send();
        next();
    }
};

module.exports = token;

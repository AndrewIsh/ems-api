const bcrypt = require('bcrypt');

// A class to create an in-memory refresh token store
// We hash all tokens with bcrypt
// Note: This class is a singleton

class TokenCache {
    constructor() {
        this.cache = {};
    }
    // Create a userId / token entry
    storeToken({ userId, newToken }) {
        const hash = this.hashToken(newToken);
        this.cache[userId] = hash;
    }
    // Hash a token
    hashToken(toHash) {
        return bcrypt.hashSync(toHash, 10);
    }
    // Remove a token from the cache
    deleteToken(token) {
        const userId = this.findByToken(token);
        delete this.cache[userId];
    }
    // Find a user ID using their token
    // Note: This is potentially a slow operation as we're performing a
    // *synchronous* compare on, potentially, every cached key. Since
    // these synchronous calls block the main thread, we may want to switch
    // to the async approach discussed in the bcrypt module's docs if this
    // becomes problematic. However, since this only gets called when a user
    // logs out or refreshes their token, it's not going to be heavily hit
    findByToken(token) {
        return Object.keys(this.cache).find((key) => bcrypt.compareSync(token, this.cache[key]));
    }
} 

const singleton = new TokenCache();

module.exports = singleton;

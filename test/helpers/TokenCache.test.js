const TokenCache = require('../../helpers/TokenCache');

jest.mock('bcrypt', () => ({
    hashSync: jest.fn().mockImplementation((toHash, rounds) => `${toHash}${rounds}`),
    compareSync: jest.fn().mockImplementation(
        (findMe) => findMe === '218710' ? true : false
    )
}));

describe('constructor', () => {
    it('runs the constructor', () => {
        expect(TokenCache).toHaveProperty('cache');
        expect(TokenCache.cache).toEqual({});
    })
});

describe('storeToken', () => {
    it('stores a token in the cache', () => {
        TokenCache.storeToken({ userId: 'Lando', newToken: '2187' });
        expect(TokenCache.cache).toEqual({Lando: '218710'})
    })
});

describe('hashToken', () => {
    it('returns the string returned by hashSync', () => {
        const hashed = TokenCache.hashToken('ISD Executor');
        expect(hashed).toEqual('ISD Executor10');
    });
});

describe('deleteToken', () => {
    it('deletes a token from the cache', () => {
        TokenCache.storeToken({ userId: 'Lando', newToken: '2187' });
        TokenCache.deleteToken('218710');
        expect(TokenCache.cache).toEqual({});
    });
});

describe('findByToken', () => {
    it('finds a token key in the cache when passed the token', () => {
        TokenCache.storeToken({ userId: 'Lando', newToken: '2187' });
        TokenCache.storeToken({ userId: 'Lobot', newToken: '1342' });
        const found = TokenCache.findByToken('218710');
        expect(found).toEqual('Lando');
    });
});
const AuthCache = require('../../classes/AuthCache');

jest.mock('bcrypt', () => ({
    hashSync: jest.fn().mockImplementation((toHash, rounds) => `${toHash}${rounds}`),
    compareSync: jest.fn().mockImplementation(
        (findMe) => findMe === '218710' ? true : false
    )
}));

describe('constructor', () => {
    it('runs the constructor', () => {
        expect(AuthCache).toHaveProperty('cache');
        expect(AuthCache.cache).toEqual({});
    })
});

describe('store', () => {
    it('stores a token in the cache', () => {
        AuthCache.store({ userId: 'Lando', newToken: '2187' });
        expect(AuthCache.cache).toEqual({ Lando: '218710' })
    })
});

describe('hashToken', () => {
    it('returns the string returned by hashSync', () => {
        const hashed = AuthCache.hashToken('ISD Executor');
        expect(hashed).toEqual('ISD Executor10');
    });
});

describe('delete', () => {
    it('deletes a token from the cache', () => {
        AuthCache.store({ userId: 'Lando', newToken: '2187' });
        AuthCache.delete('218710');
        expect(AuthCache.cache).toEqual({});
    });
});

describe('findByToken', () => {
    it('finds a token key in the cache when passed the token', () => {
        AuthCache.store({ userId: 'Lando', newToken: '2187' });
        AuthCache.store({ userId: 'Lobot', newToken: '1342' });
        const found = AuthCache.findByToken('218710');
        expect(found).toEqual('Lando');
    });
});
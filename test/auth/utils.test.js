const utils = require('../../auth/utils');
const { deserializeUser, serializeUser } = require('passport');

// Mock ems-db
jest.mock('../../../ems-db', () => ({
    resolvers: {
        users: {
            getUser: jest.fn().mockImplementation((passed) => {
                if (passed.params.id) {
                    return new Promise((resolve) => resolve(passed));
                } else {
                    return new Promise((resolve, reject) => reject(passed));
                }
            })
        }
    }
}));

// Mock passport
jest.mock('passport', () => ({
    serializeUser: jest.fn(),
    deserializeUser: jest.fn()
}));

describe('serializeCallback', () => {
    let mockCallback = {};
    beforeEach(() => {
        mockCallback = jest.fn().mockImplementation((isNull, user) => { });
    });
    it('should call the passed callback with null and the ID of the passed user', () => {
        utils.serializeCallback({ provider_id: 1 }, mockCallback);
        expect(mockCallback).toBeCalledWith(null, 1);
    });
});

describe('deserializeCallback', () => {
    let mockCallback = {};
    beforeEach(() => {
        mockCallback = jest.fn().mockImplementation((isNull, user) => { });
    });
    it('should call the passed callback with the object it gets back from getUser', async () => {
        await utils.deserializeCallback({ id: 1 }, mockCallback);
        expect(mockCallback).toBeCalledWith(null, {params: {id: 1}});
    });
    it('should catch when the call to getUser fails', async () => {
        await utils.deserializeCallback({ id: null }, mockCallback);
        expect(mockCallback).toBeCalledWith({params: {id: null}}, null);
    });
});

describe('setup', () => {
    it('should call serializeUser & deserializeUser functions', () => {
        utils.setup();
        expect(serializeUser).toBeCalled();
        expect(deserializeUser).toBeCalled();
    });
});

describe('getAvailableAuthtypes', () => {
    const OLD_ENV = process.env;
    beforeEach(() => {
        jest.resetModules();
        process.env = { ...OLD_ENV };
    });
    afterAll(() => {
        process.env = OLD_ENV;
    });
    it('should return just Google when only Google config is specified', () => {
        process.env.GOOGLE_OAUTH_CLIENT_ID = '123';
        process.env.GOOGLE_OAUTH_CLIENT_SECRET = '456';
        const available = utils.getAvailableAuthtypes();
        expect(available).toEqual([{"id": "google", "name": "Google"}]);
    });
    it('should return just SAML when only SAML config is specified', () => {
        process.env.SAML_ENTRY_POINT = '123';
        process.env.SAML_ISSUER_STRING = '456';
        process.env.SAML_LOGOUT_ENDPOINT = '789';
        const available = utils.getAvailableAuthtypes();
        expect(available).toEqual([{"id": "saml", "name": "SAML", logoutUrl: '789'}]);
    });
    it('should return Google & SAML when both configs are specified', () => {
        process.env.GOOGLE_OAUTH_CLIENT_ID = '123';
        process.env.GOOGLE_OAUTH_CLIENT_SECRET = '456';
        process.env.SAML_ENTRY_POINT = '123';
        process.env.SAML_ISSUER_STRING = '456';
        process.env.SAML_LOGOUT_ENDPOINT = '789';
        const available = utils.getAvailableAuthtypes();
        expect(available.sort()).toEqual([
            { "id": "google", "name": "Google" },
            { "id": "saml", "name": "SAML", logoutUrl: '789' }
        ]);
    });
});
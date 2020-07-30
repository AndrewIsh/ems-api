const passport = require('passport');

// The thing we're testing
const token = require('../../helpers/token');

// The TokenCache class that token.js depends on
const TokenCache = require('../../helpers/TokenCache');
const { postJwtAuth, doRefresh } = require('../../helpers/token');

const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyMyIsImlhdCI6MTU5NzMwODYwOSwiZXhwIjoxNTk3MzA5NTA5fQ.hZoxIe79mhHIgC-ihSitGPUw9R6ViRFprhh1gn-ymt4';

// Mock uuid.v4
jest.mock('uuid', () => ({
    v4: () => '123'
}));

describe('getTokenFromRequest', () => {
    it('should return the token from a request object', () => {
        const mockRequest = {
            headers: {
                authorization: `Bearer ${mockToken}`
            }
        };
        const result = token.getTokenFromRequest(mockRequest);
        expect(result).toEqual(mockToken);
    });
});

describe('getIdFromToken', () => {
    it('should take a token and return the embedded users ID', () => {
        const id = token.getIdFromToken(mockToken);
        expect(id).toEqual('23');
    });
})

describe('generateJwt', () => {
    const OLD_ENV = process.env;
    beforeEach(() => {
        jest.resetModules();
        process.env = { ...OLD_ENV };
    });
    afterAll(() => {
        process.env = OLD_ENV;
    });
    process.env.JWT_SECRET = 'my_secret';
    it('should take a user object and return a signed JWT containing their ID', () => {
        const jwt = token.generateJwt('23');
        // We can't test the entire token because it will never be the same
        // (due to iat & exp changing), so we just test the header, since
        // that will always be the same
        const splut = jwt.split('.');
        expect(splut[0]).toEqual('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9');
    });
});

describe('verifyJwt', () => {
    const OLD_ENV = process.env;
    beforeEach(() => {
        jest.resetModules();
        process.env = { ...OLD_ENV };
        process.env.JWT_SECRET = 'my_secret';
    });
    afterAll(() => {
        process.env = OLD_ENV;
    });
    it('should verify a JWT and return the payload', () => {
        const myToken = token.generateJwt('23');
        const payload = token.verifyJwt(myToken);
        // We can't test for object equality since iat & exp will vary
        expect(payload).toHaveProperty('sub');
        expect(payload).toHaveProperty('iat');
        expect(payload).toHaveProperty('exp');
    });
    it('should fail JWT verification if something is wrong', () => {
        let myToken = token.generateJwt('23');
        // Remove the last character
        myToken = myToken.slice(0, -1);
        expect(() => token.verifyJwt(myToken)).toThrowError(/invalid signature/);
    });
});

describe('generateRefresh', () => {
    it('should take a userId, call storeToken and return a generated UUID', () => {
        TokenCache.storeToken = jest.fn();
        const newToken = token.generateRefresh('89');
        expect(TokenCache.storeToken).toBeCalledWith({ userId: '89', newToken: '123' });
        expect(newToken).toEqual('123');
    });
});

describe('deleteRefresh', () => {
    it('should call TokenCache.deleteToken', () => {
        TokenCache.deleteToken = jest.fn();
        // It's just a wrapper so check it calls what it's supposed to
        token.deleteRefresh('123');
        expect(TokenCache.deleteToken).toBeCalled();
    });
});

describe('addRefreshToken', () => {
    const OLD_ENV = process.env;
    beforeEach(() => {
        jest.resetModules();
        process.env = { ...OLD_ENV };
        process.env.JWT_SECRET = 'my_secret';
    });
    afterAll(() => {
        process.env = OLD_ENV;
    });
    it('should take a response object and token and in prod call res.cookie including secure: true', () => {
        const mockResponse = {
            cookie: jest.fn().mockImplementation((key, value, options) => options)
        };
        process.env.NODE_ENV = 'production';
        token.addRefreshToken(mockResponse, '123');
        const returnedOptions = {
            httpOnly: true,
            sameSite: 'Strict',
            maxAge: 604800000,
            secure: true
        };
        expect(mockResponse.cookie).toBeCalledWith('refresh_token', '123', returnedOptions);
    });
    it('should take a response object and token and in dev call res.cookie NOT including secure: true', () => {
        const mockResponse = {
            cookie: jest.fn().mockImplementation((key, value, options) => options)
        };
        process.env.NODE_ENV = 'development';
        token.addRefreshToken(mockResponse, '123');
        const returnedOptions = {
            httpOnly: true,
            sameSite: 'Strict',
            maxAge: 604800000
        };
        expect(mockResponse.cookie).toBeCalledWith('refresh_token', '123', returnedOptions);
    });
});

// TODO: Fix these tests, for some reason they insists on calling
// the real doRefresh
/*
describe('postJwtAuth', () => {
    it('should call passport.authenticate', () => {
        passport.authenticate = jest.fn(
            (authType, callback) => () => { callback(); }
        );
        postJwtAuth('req', 'res', 'next');
        // The callback here is not correct VVV
        expect(passport.authenticate).toBeCalledWith('jwt', () => {});
    });
});
*/

describe('doRefresh', () => {
    TokenCache.findByToken = jest.fn((passed) => passed);
    const goodMockRequest = {
        cookies: {
            refresh_token: '1234'
        }
    };
    const resSet = jest.fn();
    const resStatus = jest.fn();
    const resSend = jest.fn();
    const mockNext = jest.fn();
    const mockRes = {
        set: resSet,
        status: resStatus,
        send: resSend,
        cookie: jest.fn()
    };
    // TODO: Fix this test, same problem as above, the mocked generateJwt
    // is not being called, the real one is :-(
    /*
    it('when generateRefresh fails, should form res correctly', () => {
        // Temporarily mock generateJwt so we can make it fail
        jest.doMock('../../helpers/token', () => ({
            generateJwt: jest.fn().mockImplementation(() => { throw new Error; })
        }));
        doRefresh(goodMockRequest, mockRes, mockNext);
        expect(resStatus).toBeCalledWith(401);
        expect(resSend).toBeCalledWith('Unable to generate refresh token');
        expect(mockNext).toBeCalled();
    });
    */
    it('when passed a request containing a valid refresh token, should form res correctly', () => {
        doRefresh(goodMockRequest, mockRes, mockNext);
        expect(resSet).toBeCalled();
        expect(resStatus).toBeCalledWith(200);
        expect(resSend).toBeCalled();
        expect(mockNext).toBeCalled();
    });
    const badMockRequest = {
        cookies: {
            refresh_token: null
        }
    };
    it('when passed a request with a missing token, should form res correctly', () => {
        doRefresh(badMockRequest, mockRes, mockNext);
        expect(resStatus).toBeCalledWith(401);
        expect(resSend).toBeCalledWith('Missing refresh token');
        expect(mockNext).toBeCalled();
    });
    it('when passed a request with a token not in the cache, should form res correctly', () => {
        TokenCache.findByToken = jest.fn(() => null);
        doRefresh(goodMockRequest, mockRes, mockNext);
        expect(resStatus).toBeCalledWith(401);
        expect(resSend).toBeCalledWith('Invalid refresh token');
        expect(mockNext).toBeCalled();
    });
});
// The thing we're testing
const roles = require('../../controllers/roles');

// The DB module that roles.js depends on (which we're about to mock)
const db = require('../../../ems-db');

// Mock ems-db
jest.mock('../../../ems-db', () => ({
    resolvers: {
        roles: {
            // A mock DB resolver that returns a promise that resolves
            // to whatever it was passed
            allRoles: jest.fn((passed) => {
                if (passed) {
                    return new Promise((resolve) => {
                        return resolve(passed);
                    });
                } else {
                    return new Promise((resolve, reject) => {
                        return reject(new Error('Rejected'));
                    });
                }
            })
        }
    }
}));

describe('roles', () => {
    describe('getRoles', () => {
        // res.json is used, so we should mock that
        const res = { json: jest.fn() };
        // Mock next so we can check it has been called
        const next = jest.fn();

        // Make the call
        roles.getRoles({}, res, next);

        it('should call the DB resolver', (done) => {
            expect(db.resolvers.roles.allRoles).toHaveBeenCalled();
            done();
        });
        it('should call res.json', (done) => {
            expect(res.json).toHaveBeenCalled();
            done();
        });
        it('should call next()', (done) => {
            expect(next).toHaveBeenCalled();
            done();
        });

        // Make the failed call
        roles.getRoles(false, res, next);
        it('should call next() from the catch passing the error', (done) => {
            expect(next).toHaveBeenCalledWith(new Error('Rejected'));
            done();
        });
    });
});

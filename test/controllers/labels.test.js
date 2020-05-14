// The thing we're testing
const labels = require('../../controllers/labels');

// The DB module that labels.js depends on (which we're about to mock)
const db = require('../../../ems-db');

const mockResult = { one: 'one' };

// Mock ems-db
jest.mock('../../../ems-db', () => ({
    resolvers: {
        labels: {
            // A mock DB resolver that returns a promise that resolves
            // to whatever it was passed
            allLabels: jest.fn((passed) => {
                if (passed) {
                    return new Promise((resolve) => {
                        return resolve(passed);
                    });
                } else {
                    return new Promise((resolve, reject) => {
                        return reject(new Error('Rejected'));
                    });
                }
            }),
            // A mock DB resolver that returns a promise that resolves
            // to whatever it was passed
            upsertLabel: jest.fn((passed) => {
                return new Promise((resolve) => {
                    return resolve(passed);
                });
            }),
            // A mock DB resolver that returns a promise that resolves
            // to whatever it was passed
            deleteLabel: jest.fn((passed) => {
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

describe('Labels', () => {
    describe('getLabels', () => {
        // res.json is used, so we should mock that
        const res = { json: jest.fn() };
        // Mock next so we can check it has been called
        const next = jest.fn();

        // Make the call
        labels.getLabels({}, res, next);

        it('should call the DB resolver', (done) => {
            expect(db.resolvers.labels.allLabels).toHaveBeenCalled();
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
        labels.getLabels(false, res, next);
        it('should call next() from the catch passing the error', (done) => {
            expect(next).toHaveBeenCalledWith(new Error('Rejected'));
            done();
        });
    });
    describe('upsertLabel', () => {
        // res.json is used, so we should mock that
        const res = { json: jest.fn(), send: jest.fn(), status: jest.fn() };
        // Mock next so we can check it has been called
        const next = jest.fn();

        // Make the === 0 call
        // Here we're telling our mocked upsertLabel DB resolver above to
        // pretend it's not inserted/updated a label
        labels.upsertLabel({ rowCount: 0 }, res, next);

        it('should call the DB resolver', (done) => {
            expect(db.resolvers.labels.upsertLabel).toHaveBeenCalled();
            done();
        });
        it('rowCount === 0 should call status(), passing 404', (done) => {
            expect(res.status).toBeCalledWith(404);
            done();
        });
        it('rowCount === 0 should call send()', (done) => {
            expect(res.send).toHaveBeenCalled();
            done();
        });
        it('rowCount === 0 should call next()', (done) => {
            expect(next).toHaveBeenCalled();
            done();
        });

        // Make the > 0 (else) call
        // Here we're telling our mocked upsertLabel DB resolver above to
        // pretend it's successfully inserted/updated a label
        // POST:
        labels.upsertLabel({ rowCount: 1, method: 'POST' }, res, next);

        it('rowCount > 0 & method === POST should call status(), passing 201', (done) => {
            expect(res.status).toBeCalledWith(201);
            done();
        });
        labels.upsertLabel(
            { rowCount: 1, method: 'PUT', rows: [mockResult] },
            res,
            next
        );
        it('rowCount > 0 & method === PUT should call status(), passing 200', (done) => {
            expect(res.status).toBeCalledWith(201);
            done();
        });
        it('rowCount > 0 should call json(), passing the result', (done) => {
            expect(res.json).toBeCalledWith(mockResult);
            done();
        });
        it('rowCount > 0 should call next()', (done) => {
            expect(next).toHaveBeenCalled();
            done();
        });
    });

    describe('deleteLabel', () => {
        // res.json is used, so we should mock that
        const res = { json: jest.fn(), send: jest.fn(), status: jest.fn() };
        // Mock next so we can check it has been called
        const next = jest.fn();

        // Make the === 0 call
        // Here we're telling our mocked deleteLabel DB resolver above to
        // pretend it's not deleted a label
        labels.deleteLabel({ rowCount: 0 }, res, next);

        it('should call the DB resolver', (done) => {
            expect(db.resolvers.labels.deleteLabel).toHaveBeenCalled();
            done();
        });
        it('rowCount === 0 should call status(), passing 404', (done) => {
            expect(res.status).toBeCalledWith(404);
            done();
        });
        it('rowCount === 0 should call send()', (done) => {
            expect(res.send).toHaveBeenCalled();
            done();
        });
        it('rowCount === 0 should call next()', (done) => {
            expect(next).toHaveBeenCalled();
            done();
        });

        // Make the === 1 call
        // Here we're telling our mocked deleteLabel DB resolver above to
        // pretend it has deleted a label
        labels.deleteLabel({ rowCount: 1 }, res, next);

        it('rowCount > 0 should call json()', (done) => {
            expect(res.json).toBeCalled();
            done();
        });
        it('rowCount === 0 should call status(), passing 204', (done) => {
            expect(res.status).toBeCalledWith(404);
            done();
        });
        it('rowCount > 0 should call next()', (done) => {
            expect(next).toBeCalled();
            done();
        });

        // Make the > 1 call
        // Here we're telling our mocked deleteLabel DB resolver above to
        // pretend it has deleted more than one label, this should not happen
        labels.deleteLabel({ rowCount: 2 }, res, next);

        it('rowCount > 1 should call status() passing 500', (done) => {
            expect(res.status).toBeCalledWith(500);
            done();
        });
        it('rowCount > 1 should call send()', (done) => {
            expect(res.send).toHaveBeenCalled();
            done();
        });
        it('rowCount > 1 should call next()', (done) => {
            expect(next).toBeCalled();
            done();
        });

        // Make the failure call
        labels.deleteLabel(false, res, next);
        it('should call next() from the catch passing the error', (done) => {
            expect(next).toHaveBeenCalledWith(new Error('Rejected'));
            done();
        });
    });
});

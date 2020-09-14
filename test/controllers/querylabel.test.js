// The thing we're testing
const querylabel = require('../../controllers/querylabel');

// The DB module that labels.js depends on (which we're about to mock)
const db = require('../../../ems-db');

const mockResult = { one: 'one' };

// The querylabel controller calls our addEmbeds helper, so we need
// to mock it
jest.mock('../../helpers/queries', () => ({
    addEmbeds: jest.fn(() => Promise.resolve([{ id: 1 }]))
}));

// Mock ems-db
jest.mock('../../../ems-db', () => ({
    resolvers: {
        queries: {
            getQuery: jest.fn((passed) => {
                // A mock DB resolver that returns a promise that resolves
                // to whatever it was passed
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
        },
        querylabel: {
            // A mock DB resolver that returns a promise that resolves
            // to whatever it was passed
            addLabelToQuery: jest.fn((passed) => {
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
            // To emulate a failed call, if the query_id 1138 is passed,
            // we fail
            removeLabelFromQuery: jest.fn((passed) => {
                if (passed && passed.params.query_id !== '1138') {
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

describe('QueryLabels', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });
    describe('addRemove (addLabelToQuery)', () => {
        // Because querylabel.addRemove is returns a promise, we need to await it
        // before we can test what it did.
        beforeEach(async () => {
            await querylabel.addRemove(
                {
                    rowCount: 1,
                    params: { query_id: '1,2,3', label_id: '5' },
                    rows: [mockResult]
                },
                res,
                next,
                'addLabelToQuery'
            );
        });
        // res.json is used, so we should mock that
        const res = { json: jest.fn(), send: jest.fn(), status: jest.fn() };
        // Mock next so we can check it has been called
        const next = jest.fn();

        it('should call the DB resolver 3 times', (done) => {
            expect(
                db.resolvers.querylabel.addLabelToQuery
            ).toHaveBeenCalledTimes(3);
            done();
        });

        it('should call status(), passing 200', (done) => {
            expect(res.status).toBeCalledWith(200);
            done();
        });
        it('should call json()', (done) => {
            expect(res.json).toHaveBeenCalled();
            done();
        });
        it('should call next()', (done) => {
            expect(next).toHaveBeenCalled();
            done();
        });
    });

    describe('addRemove (removeLabelFromQuery)', () => {
        describe('successful calls', () => {
            // Because querylabel.addRemove is returns a promise, we need to await it
            // before we can test what it did.
            beforeEach(async () => {
                await querylabel.addRemove(
                    {
                        rowCount: 1,
                        params: { query_id: '1,2,3', label_id: '5' },
                        rows: [mockResult]
                    },
                    res,
                    next,
                    'removeLabelFromQuery'
                );
            });
            // res.json is used, so we should mock that
            const res = { json: jest.fn(), send: jest.fn(), status: jest.fn() };
            // Mock next so we can check it has been called
            const next = jest.fn();

            it('should call the DB resolver 3 times', (done) => {
                expect(
                    db.resolvers.querylabel.removeLabelFromQuery
                ).toHaveBeenCalledTimes(3);
                done();
            });

            it('should call status(), passing 200', (done) => {
                expect(res.status).toBeCalledWith(200);
                done();
            });
            it('should call json()', (done) => {
                expect(res.json).toHaveBeenCalled();
                done();
            });
            it('should call next()', (done) => {
                expect(next).toHaveBeenCalled();
                done();
            });
        });

        describe('failed calls', () => {
            // Because querylabel.addRemove is returns a promise, we need to await it
            // before we can test what it did.
            beforeEach(async () => {
                await querylabel.addRemove(
                    {
                        rowCount: 1,
                        params: { query_id: '1138', label_id: '5' },
                        rows: [mockResult]
                    },
                    res,
                    next,
                    'removeLabelFromQuery'
                );
            });
            // res.json is used, so we should mock that
            const res = { json: jest.fn(), send: jest.fn(), status: jest.fn() };
            // Mock next so we can check it has been called
            const next = jest.fn();

            it('should call next() from the catch passing the error', (done) => {
                expect(next).toHaveBeenCalledWith(new Error('Rejected'));
                done();
            });
        });
    });
});

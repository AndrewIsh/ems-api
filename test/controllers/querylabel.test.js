// The thing we're testing
const querylabel = require('../../controllers/querylabel');

// The DB module that labels.js depends on (which we're about to mock)
const db = require('../../../ems-db');

const mockResult = { one: 'one' };

// The querylabel controller calls our addEmbeds helper, so we need
// to mock it
jest.mock('../../helpers/queries', () => ({
    addEmbeds: jest.fn(() => Promise.resolve([{id: 1}]))
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
            removeLabelFromQuery: jest.fn((passed) => {
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

describe('QueryLabels', () => {
    describe('addRemove (addLabelToQuery)', () => {
        // res.json is used, so we should mock that
        const res = { json: jest.fn(), send: jest.fn(), status: jest.fn() };
        // Mock next so we can check it has been called
        const next = jest.fn();

        // Make the === 0 call
        // Here we're telling our mocked addLabelToQuery DB resolver above to
        // pretend it's not inserted/updated a label
        querylabel.addRemove({ rowCount: 0 }, res, next, 'addLabelToQuery');

        it('should call the DB resolver', (done) => {
            expect(db.resolvers.querylabel.addLabelToQuery).toHaveBeenCalled();
            done();
        });
        it('rowCount === 0 should call status(), passing 500', (done) => {
            expect(res.status).toBeCalledWith(500);
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

        // Make the == 1 call
        // Here we're telling our mocked addLabelToQuery DB resolver above to
        // pretend it's successfully inserted label query relationship
        // POST:
        querylabel.addRemove(
            { rowCount: 1, params: { query_id: 1 }, rows: [mockResult] },
            res,
            next,
            'addLabelToQuery'
        );

        it('rowCount == 1 should call status(), passing 200', (done) => {
            expect(res.status).toBeCalledWith(200);
            done();
        });
        it('rowCount == 1 should call json()', (done) => {
            expect(res.json).toHaveBeenCalled();
            done();
        });
        it('rowCount == 1 should call next()', (done) => {
            expect(next).toHaveBeenCalled();
            done();
        });

        // Make the > 1 call
        // Here we're telling our mocked addLabelToQuery DB resolver above to
        // pretend it's updated > 1 rows which shouldn't ever happen
        // POST:
        querylabel.addRemove({ rowCount: 2 }, res, next, 'addLabelToQuery');

        it('rowCount > 1 should call status(), passing 500', (done) => {
            expect(res.status).toBeCalledWith(500);
            done();
        });
        it('rowCount > 1 should call send()', (done) => {
            expect(res.send).toHaveBeenCalled();
            done();
        });
        it('rowCount > 1 should call next()', (done) => {
            expect(next).toHaveBeenCalled();
            done();
        });

        // Make the failed call
        querylabel.addRemove(false, res, next, 'addLabelToQuery');
        it('should call next() from the catch passing the error', (done) => {
            expect(next).toHaveBeenCalledWith(new Error('Rejected'));
            done();
        });
    });

    describe('addRemove (removeLabelFromQuery)', () => {
        // res.json is used, so we should mock that
        const res = { json: jest.fn(), send: jest.fn(), status: jest.fn() };
        // Mock next so we can check it has been called
        const next = jest.fn();

        // Make the === 0 call
        // Here we're telling our mocked removeLabelFromQuery DB resolver above to
        // pretend it's not inserted/updated a label query relationship
        querylabel.addRemove({ rowCount: 0 }, res, next, 'removeLabelFromQuery');

        it('should call the DB resolver', (done) => {
            expect(
                db.resolvers.querylabel.removeLabelFromQuery
            ).toHaveBeenCalled();
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

        // Make the == 1 call
        // Here we're telling our mocked removeLabelFromQuery DB resolver above to
        // pretend it's successfully inserted 1 label query relationship
        // POST:
        querylabel.addRemove({
            rowCount: 1, params: { query_id: 1 }
        }, res, next, 'removeLabelFromQuery');

        it('rowCount == 1 should call status(), passing 200', (done) => {
            expect(res.status).toBeCalledWith(200);
            done();
        });
        it('rowCount == 1 should call json()', (done) => {
            expect(res.json).toHaveBeenCalled();
            done();
        });
        it('rowCount == 1 should call next()', (done) => {
            expect(next).toHaveBeenCalled();
            done();
        });

        // Make the > 1 call
        // Here we're telling our mocked removeLabelFromQuery DB resolver above to
        // pretend it's deleted > 1 rows which shouldn't ever happen
        // POST:
        querylabel.addRemove({ rowCount: 2 }, res, next, 'removeLabelFromQuery');

        it('rowCount > 1 should call status(), passing 500', (done) => {
            expect(res.status).toBeCalledWith(500);
            done();
        });
        it('rowCount > 1 should call send()', (done) => {
            expect(res.send).toHaveBeenCalled();
            done();
        });
        it('rowCount > 1 should call next()', (done) => {
            expect(next).toHaveBeenCalled();
            done();
        });

        // Make the failed call
        querylabel.addRemove(false, res, next, 'removeLabelFromQuery');
        it('should call next() from the catch passing the error', (done) => {
            expect(next).toHaveBeenCalledWith(new Error('Rejected'));
            done();
        });
    });
});

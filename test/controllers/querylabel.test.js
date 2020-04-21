// The thing we're testing
const querylabel = require('../../controllers/querylabel');

// The DB module that labels.js depends on (which we're about to mock)
const db = require('../../../ems-db');

const mockResult = { one: 'one' };

// Mock ems-db
jest.mock('../../../ems-db', () => ({
    resolvers: {
        querylabel: {
            // A mock DB resolver that returns a promise that resolves
            // to whatever it was passed
            addLabelToQuery: jest.fn((passed) => {
                return new Promise((resolve) => {
                    return resolve(passed);
                });
            }),
            // A mock DB resolver that returns a promise that resolves
            // to whatever it was passed
            removeLabelFromQuery: jest.fn((passed) => {
                return new Promise((resolve) => {
                    return resolve(passed);
                });
            })
        }
    }
}));

describe('QueryLabels', () => {
    describe('addLabelToQuery', () => {
        // res.json is used, so we should mock that
        const res = { json: jest.fn(), send: jest.fn(), status: jest.fn() };
        // Mock next so we can check it has been called
        const next = jest.fn();

        // Make the === 0 call
        // Here we're telling our mocked addLabelToQuery DB resolver above to
        // pretend it's not inserted/updated a label
        querylabel.addLabelToQuery({ rowCount: 0 }, res, next);

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
        querylabel.addLabelToQuery(
            { rowCount: 1, rows: [mockResult] },
            res,
            next
        );

        it('rowCount == 1 should call status(), passing 201', (done) => {
            expect(res.status).toBeCalledWith(201);
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
        querylabel.addLabelToQuery({ rowCount: 2 }, res, next);

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
    });

    describe('removeLabelFromQuery', () => {
        // res.json is used, so we should mock that
        const res = { json: jest.fn(), send: jest.fn(), status: jest.fn() };
        // Mock next so we can check it has been called
        const next = jest.fn();

        // Make the === 0 call
        // Here we're telling our mocked removeLabelFromQuery DB resolver above to
        // pretend it's not inserted/updated a label query relationship
        querylabel.removeLabelFromQuery({ rowCount: 0 }, res, next);

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
        querylabel.removeLabelFromQuery({ rowCount: 1 }, res, next);

        it('rowCount == 1 should call status(), passing 204', (done) => {
            expect(res.status).toBeCalledWith(204);
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
        querylabel.removeLabelFromQuery({ rowCount: 2 }, res, next);

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
    });
});

// The thing we're testing
const queries = require('../../controllers/queries');

// The DB module that queries.js depends on (which we're about to mock)
const db = require('../../../ems-db');

const helpers = require('../../helpers/queries');

const mockResult = { id: 1 };

// Mock helpers
jest.mock('../../helpers/queries', () => ({
    addEmbeds: jest.fn((passed) => {
        return Promise.resolve(passed);
    })
}));


// Mock ems-db
jest.mock('../../../ems-db', () => ({
    resolvers: {
        queries: {
            // A mock DB resolver that returns a promise that resolves
            // to whatever it was passed
            allQueries: jest.fn((passed) => {
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
            getQuery: jest.fn((passed) => {
                if (!passed.fail) {
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
            upsertQuery: jest.fn((passed) => {
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
            deleteQuery: jest.fn((passed) =>
                !passed.fail ?
                    Promise.resolve(passed) :
                    Promise.reject(new Error('Rejected'))
            ),
            // A mock DB resolver that returns an array of promises,
            // each resolving to what was passed
            updateBulk: jest.fn((passed) => {
                if (passed) {
                    return passed.body.map((passedItem) => 
                        Promise.resolve(passedItem)
                    );
                } else {
                    // Return an array containing 3 promise rejections
                    return [1, 2, 3].map(() => {
                        return new Promise((resolve, reject) => {
                            return reject(new Error('Rejected'));
                        });
                    });
                }
            }),
            // A mock DB resolver for initiators that returns a mock initiator
            initiators: jest.fn((passed) => {
                if (passed) {
                    return new Promise((resolve) => {
                        return resolve({ rows: [{ id: 1, initiator: 1 }] });
                    });
                } else {
                    return new Promise((resolve, reject) => {
                        return reject(new Error('Rejected'));
                    });
                }
            }),
            // A mock DB resolver for participants that returns a mock
            // participant
            participants: jest.fn((passed) => {
                if (passed) {
                    return new Promise((resolve) => {
                        return resolve({
                            rows: [{ query_id: 1, creator_id: 1 }]
                        });
                    });
                } else {
                    return new Promise((resolve, reject) => {
                        return reject(new Error('Rejected'));
                    });
                }
            }),
            // A mock DB resolver for latest messages that returns a mock
            // object
            latestMessages: jest.fn((passed) => {
                if (passed) {
                    return new Promise((resolve) => {
                        return resolve({ rows: [{ query_id: 1 }] });
                    });
                } else {
                    return new Promise((resolve, reject) => {
                        return reject(new Error('Rejected'));
                    });
                }
            }),
            // A mock DB resolver for labels that returns a mock
            // object
            labels: jest.fn((passed) => {
                if (passed) {
                    return new Promise((resolve) => {
                        return resolve({
                            rows: [{ query_id: 1, label_id: 1 }]
                        });
                    });
                } else {
                    return new Promise((resolve, reject) => {
                        return reject(new Error('Rejected'));
                    });
                }
            }),
            associated: jest.fn(() => Promise.resolve([3]))
        },
        queryuser: {
            upsertQueryUsers: jest.fn(() => Promise.resolve())
        },
        users: {
            allStaff: jest.fn(() => Promise.resolve({ rows: [{ id: 1 }] }))
        }
    }
}));

describe('Queries', () => {
    describe('getQueries', () => {
        // res.json is used, so we should mock that
        const res = { json: jest.fn() };
        // Mock next so we can check it has been called
        const next = jest.fn();
        // Our expected response
        const response = [
            { id: 1 }
        ];
        it('should call the DB resolver', async (done) => {
            await queries.getQueries({ rows: [{ id: 1 }] }, res, next);
            expect(db.resolvers.queries.allQueries).toHaveBeenCalled();
            done();
        });
        it('should call the addEmbeds helper', async (done) => {
            await queries.getQueries({ rows: [{ id: 1 }] }, res, next);
            expect(helpers.addEmbeds).toHaveBeenCalled();
            done();
        });
        it('should call res.json with the correct response', async (done) => {
            await queries.getQueries({ rows: [{ id: 1 }] }, res, next);
            expect(res.json).toHaveBeenCalledWith(response);
            done();
        });
        it('should call next()', async (done) => {
            await queries.getQueries({ rows: [{ id: 1 }] }, res, next);
            expect(next).toHaveBeenCalled();
            done();
        });

        // Make the failed call
        it('should call next() from the catch passing the error', async (done) => {
            await queries.getQueries(false, res, next);
            expect(next).toHaveBeenCalledWith(new Error('Rejected'));
            done();
        });
    });

    describe('getQuery', () => {
        // res.json is used, so we should mock that
        const res = { json: jest.fn(), send: jest.fn(), status: jest.fn() };
        // Mock next so we can check it has been called
        const next = jest.fn();
        // Our expected response
        const response = {
            id: 1
        };

        // Make the === 0 (else) call
        // Here we're telling our mocked getQuery DB resolver above to
        // pretend it's returning 1 result
        const zeroCall = (req) => queries.getQuery(req, res, next);
    
        const defaultReq = {
            rowCount: 0,
            params: {
                id: 3
            },
            user: {
                id: 3
            }
        };

        it('should call the DB resolver', async (done) => {
            await zeroCall(defaultReq);
            expect(db.resolvers.queries.getQuery).toHaveBeenCalled();
            done();
        });
        it('A invalid user should call status(), passing 404', async (done) => {
            await zeroCall({...defaultReq, user: { id: 1 }});
            expect(res.status).toBeCalledWith(404);
            expect(res.send).toBeCalled();
            done();
        });
        it('rowCount === 0 should call status(), passing 404', async (done) => {
            await zeroCall(defaultReq);
            expect(res.status).toBeCalledWith(404);
            done();
        });
        it('rowCount === 0 should call send()', async (done) => {
            await zeroCall(defaultReq);
            expect(res.send).toHaveBeenCalled();
            done();
        });
        it('rowCount === 0 should call next()', async (done) => {
            await zeroCall(defaultReq);
            expect(next).toHaveBeenCalled();
            done();
        });

        // Make the === 1 call
        // Here we're telling our mocked getQuery DB resolver above to
        // pretend it's returning 1 result
        const oneCall = () => queries.getQuery(
            {
                rowCount: 1,
                rows: [{ id: 1 }],
                params: {
                    id: 3
                },
                user: {
                    id: 3
                }
            },
            res,
            next
        );

        it('rowCount === 1 should call json(), passing the result', async (done) => {
            await oneCall();
            expect(res.json).toBeCalledWith(response);
            done();
        });
        it('rowCount === 1 should call next()', async (done) => {
            await oneCall();
            expect(next).toHaveBeenCalled();
            done();
        });

        // Make the > 1 call
        // Here we're telling our mocked getQuery DB resolver above to
        // pretend it's returning 3 results
        const moreCall = () => queries.getQuery({
            rowCount: 3,
            params: {
                id: 3
            },
            user: {
                id: 3
            }
        }, res, next);

        it('rowCount > 1 should call status(), passing 400', async (done) => {
            await moreCall();
            expect(res.status).toBeCalledWith(500);
            done();
        });
        it('rowCount > 1 should call send()', async (done) => {
            await moreCall();
            expect(res.send).toHaveBeenCalled();
            done();
        });
        it('rowCount > 1 should call next()', async (done) => {
            await moreCall();
            expect(next).toHaveBeenCalled();
            done();
        });

        // Make the failed call
        const failCall = () => queries.getQuery(
            {
                fail: true,
                params: {
                    id: 3
                },
                user: {
                    id: 3
                }
            },
            res,
            next
        );
        it('should call next() from the catch passing the error', async (done) => {
            await failCall();
            expect(next).toHaveBeenCalledWith(new Error('Rejected'));
            done();
        });
    });

    describe('upsertQuery', () => {
        // res.json is used, so we should mock that
        const res = { json: jest.fn(), send: jest.fn(), status: jest.fn() };
        // Mock next so we can check it has been called
        const next = jest.fn();

        // Make the === 0 call
        // Here we're telling our mocked upsertQuery DB resolver above to
        // pretend it's not inserted/updated a query
        const zeroCall = () => queries.upsertQuery(
            { rowCount: 0 },
            res,
            next
        );

        it('should call the DB resolver', async (done) => {
            await zeroCall();
            expect(db.resolvers.queries.upsertQuery).toHaveBeenCalled();
            done();
        });
        it('rowCount === 0 should call status(), passing 404', async (done) => {
            await zeroCall();
            expect(res.status).toBeCalledWith(404);
            done();
        });
        it('rowCount === 0 should call send()', async (done) => {
            await zeroCall();
            expect(res.send).toHaveBeenCalled();
            done();
        });
        it('rowCount === 0 should call next()', async (done) => {
            await zeroCall();
            expect(next).toHaveBeenCalled();
            done();
        });

        // Make the > 0 (else) call
        // Here we're telling our mocked upsertQuery DB resolver above to
        // pretend it's successfully inserted/updated a query
        // POST:
        const moreCallPost = () => queries.upsertQuery(
            {
                user: { id: 1 },
                rowCount: 1,
                rows: [mockResult],
                method: 'POST'
            },
            res,
            next
        );

        it('rowCount > 0 & method === POST should call status(), passing 201', async (done) => {
            await moreCallPost();
            expect(res.status).toBeCalledWith(201);
            done();
        });

        const putParams = {
            user: { id: 1 },
            rowCount: 1,
            rows: [mockResult],
            method: 'PUT'
        };
        const moreCallPut = (req) => queries.upsertQuery(
            req,
            res,
            next
        );
        it('A invalid user should call status(), passing 404', async (done) => {
            await moreCallPut({...putParams, user: { id: 3 }});
            expect(res.status).toBeCalledWith(404);
            expect(res.send).toBeCalled();
            done();
        });
        it('rowCount > 0 & method === PUT should call status(), passing 200', async (done) => {
            await moreCallPut(putParams);
            expect(res.status).toBeCalledWith(201);
            done();
        });
        it('rowCount > 0 should call json(), passing the result', async (done) => {
            await moreCallPut(putParams);
            expect(res.json).toBeCalledWith(mockResult);
            done();
        });
        it('rowCount > 0 should call next()', async (done) => {
            await moreCallPut(putParams);
            expect(next).toHaveBeenCalled();
            done();
        });

        // Make the failed call
        const failCall = () => queries.upsertQuery(false, res, next);
        it('should call next() from the catch passing the error', async (done) => {
            await failCall();
            expect(next).toHaveBeenCalledWith(new Error('Rejected'));
            done();
        });
    });

    describe('deleteQuery', () => {
        afterEach(() => { jest.clearAllMocks(); });
        // res.json is used, so we should mock that
        const res = { json: jest.fn(), send: jest.fn(), status: jest.fn() };
        // Mock next so we can check it has been called
        const next = jest.fn();

        // Make the === 0 call
        // Here we're telling our mocked deleteQuery DB resolver above to
        // pretend it's not deleted a query
        const zeroCall = (get) => queries.deleteQuery(get, res, next);

        const defaultGet = {
            user: { id: 1 },
            rowCount: 0
        };

        it('should call the DB resolver', async (done) => {
            await zeroCall(defaultGet);
            expect(db.resolvers.queries.deleteQuery).toHaveBeenCalled();
            done();
        });
        it('A invalid user should call status(), passing 404', async (done) => {
            await zeroCall({...defaultGet, user: { id: 3 }});
            expect(res.status).toBeCalledWith(404);
            expect(res.send).toBeCalled();
            done();
        });
        it('rowCount === 0 should call status(), passing 404', async (done) => {
            await zeroCall(defaultGet);
            expect(res.status).toBeCalledWith(404);
            done();
        });
        it('rowCount === 0 should call send()', async (done) => {
            await zeroCall(defaultGet);
            expect(res.send).toHaveBeenCalled();
            done();
        });
        it('rowCount === 0 should call next()', async (done) => {
            await zeroCall(defaultGet);
            expect(next).toHaveBeenCalled();
            done();
        });

        // Make the === 1 call
        // Here we're telling our mocked deleteQuery DB resolver above to
        // pretend it has deleted a query
        const oneCall = () => queries.deleteQuery({
            user: { id: 1 },
            rowCount: 1
        }, res, next);

        it('rowCount > 0 should call json()', async (done) => {
            await oneCall();
            expect(res.json).toBeCalled();
            done();
        });
        it('rowCount > 0 should call next()', async (done) => {
            await oneCall();
            expect(next).toBeCalled();
            done();
        });

        // Make the > 1 call
        // Here we're telling our mocked deleteQuery DB resolver above to
        // pretend it has deleted more than one query, this should not happen
        const moreCall = () => queries.deleteQuery({
            user: { id: 1 },
            rowCount: 2
        }, res, next);

        it('rowCount > 1 should call status() passing 500', async (done) => {
            await moreCall();
            expect(res.status).toBeCalledWith(500);
            done();
        });
        it('rowCount > 1 should call send()', async (done) => {
            await moreCall();
            expect(res.send).toHaveBeenCalled();
            done();
        });
        it('rowCount > 1 should call next()', async (done) => {
            await moreCall();
            expect(next).toBeCalled();
            done();
        });

        // Make the failed call
        const failedCall = () => queries.deleteQuery(
            { user: { id: 1 }, fail: true },
            res,
            next
        );
        it('should call next() from the catch passing the error', async (done) => {
            await failedCall();
            expect(next).toBeCalledWith(new Error('Rejected'));
            done();
        });
    });

    describe('updateBulk', () => {
        const update = (get) => queries.updateBulk(get, res, next);
        const defaultGet = {
            user: { id: 1 },
            body: [
                { rowCount: 1, rows: [mockResult], method: 'PUT' },
                { rowCount: 1, rows: [mockResult], method: 'PUT' },
                { rowCount: 1, rows: [mockResult], method: 'PUT' }
            ]
        };
        // res.json is used, so we should mock that
        const res = { json: jest.fn(), send: jest.fn(), status: jest.fn() };
        // Mock next so we can check it has been called
        const next = jest.fn();

        // Here we're telling our mocked upsertQuery DB resolver above to
        // pretend it's successfully updated 3 queries
        // POST:
        it('the updateBulk DB resolver should be called', async (done) => {
            await update(defaultGet);
            expect(db.resolvers.queries.updateBulk).toHaveBeenCalled();
            done();
        });
        it('A invalid user should call status(), passing 404', async (done) => {
            await update({...defaultGet, user: { id: 3 }});
            expect(res.status).toBeCalledWith(404);
            expect(res.send).toBeCalled();
            done();
        });
        it('status() should be called, passing 200', async (done) => {
            await update(defaultGet);
            expect(res.status).toBeCalledWith(200);
            done();
        });
        it('json() should be called, passing the 3 results', async (done) => {
            const mockResults = [
                { id: 1 },
                { id: 1 },
                { id: 1 }
            ];
            await update(defaultGet);
            expect(res.json).toBeCalledWith(mockResults);
            done();
        });
        it('should call next()', async (done) => {
            await update(defaultGet);
            expect(next).toHaveBeenCalled();
            done();
        });
    });
});

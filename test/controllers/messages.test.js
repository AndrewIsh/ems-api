// The thing we're testing
const messages = require('../../controllers/messages');

// The DB modules that messages.js depends on (which we're about to mock)
const fs = require('fs');
const db = require('../../../ems-db');

const mockResult = { one: 'one', query_id: 1 };

jest.mock('fs');

// Mock ems-db
jest.mock('../../../ems-db', () => ({
    resolvers: {
        messages: {
            // A mock DB resolver that returns a promise that resolves
            // to whatever it was passed
            allMessages: jest.fn((passed) => {
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
            getMessage: jest.fn((passed) => {
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
            upsertMessage: jest.fn((passed) => {
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
            deleteMessage: jest.fn((passed) => {
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
        queries: {
            // A mock DB resolver that returns a promise that resolves
            // to whatever it was passed
            participants: jest.fn((passed) => {
                return new Promise((resolve) => {
                    return resolve(passed);
                });
            }),
            associated: jest.fn((passed) => {
                return new Promise((resolve) => {
                    return resolve(passed);
                });
            }),
            getQuery: jest.fn((passed) => {
                return new Promise((resolve) => {
                    return resolve(passed);
                });
            })
        }
    }
}));

describe('Messages', () => {
    describe('getMessages', () => {
        // res.json, res.status, res.send are used, so we should mock that
        const res = { json: jest.fn(), status: jest.fn(), send: jest.fn() };
        // Mock next so we can check it has been called
        const next = jest.fn();

        // Make the call
        messages.getMessages(
            { rows: [{ ...mockResult, creator_id: 1 }] },
            res,
            next
        );

        it('should call the DB resolver', (done) => {
            expect(db.resolvers.messages.allMessages).toHaveBeenCalled();
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
        messages.getMessages(false, res, next);
        it('should call next() from the catch passing the error', (done) => {
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.send).toHaveBeenCalled();
            expect(next).toHaveBeenCalledWith();
            done();
        });
    });
    describe('upsertMessage', () => {
        // res.json is used, so we should mock that
        const res = { json: jest.fn(), send: jest.fn(), status: jest.fn() };
        // Mock next so we can check it has been called
        const next = jest.fn();

        // Make the === 0 call
        // Here we're telling our mocked upsertMessage DB resolver above to
        // pretend it's not inserted/updated a message
        messages.upsertMessage({ rowCount: 0, rows: [{ creator_id: 1 }], user: { id: 1 } }, res, next);

        it('should call the DB resolver', (done) => {
            expect(db.resolvers.messages.upsertMessage).toHaveBeenCalled();
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
        // Here we're telling our mocked upsertMessage DB resolver above to
        // pretend it's successfully inserted/updated a message
        // POST:
        messages.upsertMessage(
            { rowCount: 1, rows: [mockResult], method: 'POST', body: { query_id: 1, creator_id: 1 }, user: { id: 1 } },
            res,
            next
        );

        it('rowCount > 0 & method === POST should call status(), passing 201', (done) => {
            expect(res.status).toBeCalledWith(201);
            done();
        });
        messages.upsertMessage(
            { rowCount: 1, method: 'PUT', rows: [mockResult], user: { id: 1 } },
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

    describe('deleteMessage', () => {
        // res.json is used, so we should mock that
        const res = { json: jest.fn(), send: jest.fn(), status: jest.fn() };
        // Mock next so we can check it has been called
        const next = jest.fn();

        // Make the === 0 call
        // Here we're telling our mocked deleteMessage DB resolver above to
        // pretend it's not deleted a message
        messages.deleteMessage({ rowCount: 1, rows: [{ creator_id: 1 }], user: { id: 1 } }, res, next);

        it('should call the DB resolver', (done) => {
            expect(db.resolvers.messages.deleteMessage).toHaveBeenCalled();
            done();
        });
        messages.deleteMessage({ rowCount: 0, rows: [{ creator_id: 1 }], user: { id: 1 } }, res, next);
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
        // Here we're telling our mocked deleteMessage DB resolver above to
        // pretend it has deleted a message
        messages.deleteMessage({ rowCount: 1, rows: [mockResult], user: { id: 1 } }, res, next);

        it('rowCount > 0 should call json()', (done) => {
            expect(res.json).toBeCalled();
            done();
        });
        it('rowCount === 0 should call status(), passing 404', (done) => {
            expect(res.status).toBeCalledWith(404);
            done();
        });
        it('rowCount > 0 should call next()', (done) => {
            expect(next).toBeCalled();
            done();
        });

        // Make the === 1 call with an attachment
        // Here we're telling our mocked deleteMessage DB resolver above to
        // pretend it has deleted a message with an attachment
        messages.deleteMessage(
            { rowCount: 1, rows: [{ filename: 'myfile.txt', creator_id: 1 }], user: { id: 1 } },
            res,
            next
        );

        it('rowCount > 0 should call json()', (done) => {
            expect(res.json).toBeCalled();
            done();
        });
        it('rowCount === 0 should call status(), passing 404', (done) => {
            expect(res.status).toBeCalledWith(404);
            done();
        });
        it('rowCount > 0 should call next()', (done) => {
            expect(next).toBeCalled();
            done();
        });
        it('rowCount === 1 with file attachment should call fs.unlinkSync()', (done) => {
            expect(fs.unlinkSync).toBeCalled();
            done();
        });

        // Make the > 1 call
        // Here we're telling our mocked deleteMessage DB resolver above to
        // pretend it has deleted more than one message, this should not happen
        messages.deleteMessage({ rowCount: 2, rows: [{ creator_id: 1 }], user: { id: 1 } }, res, next);

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
    });
});

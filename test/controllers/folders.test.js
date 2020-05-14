// The thing we're testing
const folders = require('../../controllers/folders');

// The DB module that folders.js depends on (which we're about to mock)
const db = require('../../../ems-db');

const mockResult = { one: 'one' };

// Mock ems-db
jest.mock('../../../ems-db', () => ({
    resolvers: {
        folders: {
            // A mock DB resolver that returns a promise that resolves
            // to whatever it was passed
            allFolders: jest.fn((passed) => {
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
            upsertFolder: jest.fn((passed) => {
                return new Promise((resolve) => {
                    return resolve(passed);
                });
            }),
            // A mock DB resolver that returns a promise that resolves
            // to whatever it was passed
            deleteFolder: jest.fn((passed) => {
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

describe('Folders', () => {
    describe('getFolders', () => {
        // res.json is used, so we should mock that
        const res = { json: jest.fn() };
        // Mock next so we can check it has been called
        const next = jest.fn();

        // Make the successful call
        folders.getFolders(true, res, next);
        it('should call the DB resolver', (done) => {
            expect(db.resolvers.folders.allFolders).toHaveBeenCalled();
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
        folders.getFolders(false, res, next);
        it('should call next() from the catch passing the error', (done) => {
            expect(next).toHaveBeenCalledWith(new Error('Rejected'));
            done();
        });
    });
    describe('upsertFolder', () => {
        // res.json is used, so we should mock that
        const res = { json: jest.fn(), send: jest.fn(), status: jest.fn() };
        // Mock next so we can check it has been called
        const next = jest.fn();

        // Make the === 0 call
        // Here we're telling our mocked upsertFolder DB resolver above to
        // pretend it's not inserted/updated a folder
        folders.upsertFolder({ rowCount: 0 }, res, next);

        it('should call the DB resolver', (done) => {
            expect(db.resolvers.folders.upsertFolder).toHaveBeenCalled();
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
        // Here we're telling our mocked upsertFolder DB resolver above to
        // pretend it's successfully inserted/updated a folder
        // POST:
        folders.upsertFolder({ rowCount: 1, method: 'POST' }, res, next);

        it('rowCount > 0 & method === POST should call status(), passing 201', (done) => {
            expect(res.status).toBeCalledWith(201);
            done();
        });
        folders.upsertFolder(
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

    describe('deleteFolder', () => {
        // res.json is used, so we should mock that
        const res = { json: jest.fn(), send: jest.fn(), status: jest.fn() };
        // Mock next so we can check it has been called
        const next = jest.fn();

        // Make the === 0 call
        // Here we're telling our mocked deleteFolder DB resolver above to
        // pretend it's not deleted a folder
        folders.deleteFolder({ rowCount: 0 }, res, next);

        it('should call the DB resolver', (done) => {
            expect(db.resolvers.folders.deleteFolder).toHaveBeenCalled();
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
        // Here we're telling our mocked deleteFolder DB resolver above to
        // pretend it has deleted a folder
        folders.deleteFolder({ rowCount: 1 }, res, next);

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
        // Here we're telling our mocked deleteFolder DB resolver above to
        // pretend it has deleted more than one folder, this should not happen
        folders.deleteFolder({ rowCount: 2 }, res, next);

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
        folders.deleteFolder(false, res, next);
        it('should call next() from the catch passing the error', (done) => {
            expect(next).toHaveBeenCalledWith(new Error('Rejected'));
            done();
        });
    });
});

// The thing we're testing
const helpers = require('../../helpers/queries');

// The DB module that queries.js depends on (which we're about to mock)
const db = require('../../../ems-db');

// Mock ems-db
jest.mock('../../../ems-db', () => {
    return {
        resolvers: {
            queries: {
                initiators: jest.fn().mockImplementation(
                    () =>
                        new Promise((resolve) =>
                            resolve({
                                rows: [
                                    { id: 1, initiator: 1 },
                                    { id: 2, initiator: 4 }
                                ]
                            })
                        )
                ),
                participants: jest.fn().mockImplementation(
                    () =>
                        new Promise((resolve) =>
                            resolve({
                                rows: [
                                    { query_id: 1, creator_id: 1 },
                                    { query_id: 2, creator_id: 1 }
                                ]
                            })
                        )
                ),
                labels: jest.fn().mockImplementation(
                    () =>
                        new Promise((resolve) =>
                            resolve({
                                rows: [
                                    { query_id: 1, label_id: 3 },
                                    { query_id: 2, label_id: 5 },
                                    { query_id: 2, label_id: 6 }
                                ]
                            })
                        )
                ),
                latestMessages: jest.fn().mockImplementation(
                    () =>
                        new Promise((resolve) =>
                            resolve({
                                rows: [
                                    { query_id: 1, text: 'Gonk' },
                                    { query_id: 2, text: 'Utini' }
                                ]
                            })
                        )
                )
            }
        }
    };
});

const mockQueries = {
    rows: [
        {
            id: 1,
            name: 'Toshi Station'
        },
        {
            id: 2,
            name: 'Mos Eisley'
        }
    ]
};

describe('queries', () => {
    describe('addEmbeds', () => {
        // Make the call
        helpers.addEmbeds(mockQueries);

        it('should call initiators with the IDs of the passed queries', (done) => {
            expect(db.resolvers.queries.initiators).toHaveBeenCalledWith([
                1,
                2
            ]);
            done();
        });
        it('should call participants with the IDs of the passed queries', (done) => {
            expect(db.resolvers.queries.participants).toHaveBeenCalledWith([
                1,
                2
            ]);
            done();
        });
        it('should call labels with the IDs of the passed queries', (done) => {
            expect(db.resolvers.queries.labels).toHaveBeenCalledWith([1, 2]);
            done();
        });
        it('should call latest with the IDs of the passed queries', (done) => {
            expect(db.resolvers.queries.latestMessages).toHaveBeenCalledWith([
                1,
                2
            ]);
            done();
        });
        it('should return correctly embellished query objects', () => {
            return helpers.addEmbeds(mockQueries).then((ret) => {
                expect(ret).toEqual([
                    {
                        id: 1,
                        name: 'Toshi Station',
                        initiator: 1,
                        participants: [1],
                        latestMessage: { query_id: 1, text: 'Gonk' },
                        labels: [3]
                    },
                    {
                        id: 2,
                        name: 'Mos Eisley',
                        initiator: 4,
                        participants: [1],
                        latestMessage: { query_id: 2, text: 'Utini' },
                        labels: [5, 6]
                    }
                ]);
            });
        });
    });
});

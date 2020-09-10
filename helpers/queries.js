const db = require('../../ems-db');

const queries = {
    addEmbeds: async (queries) => {
        // Don't proceed if we don't need to
        if (queries.length === 0) {
            return [];
        } else if (queries[0].hasOwnProperty('latestMessage')) {
            // These queries already have embeds
            return queries;
        }
        // We need the IDs of all queries we received
        const query_ids = queries.map(query => query.id);
        // Now get the initiators for all the queries we've
        // received, we also receive their associated query ID
        const initiators = await db.resolvers.queries.initiators(
            query_ids
        );
        // Now get the participants of all retrieved queries
        const participants = await db.resolvers.queries.participants(
            query_ids
        );
        // Now get the labels for all retrieved queries
        const labels = await db.resolvers.queries.labels(
            query_ids
        );
        // Finally get the most recent message for each retrieved query
        const latest = await db.resolvers.queries.latestMessages(
            query_ids
        );
        // Now we have everything, we can bundle it all up together
        return queries.map(query => {
            // The initiator for this query
            const queryInitiator = initiators.rows.find(
                init => init.id === query.id
            ).initiator;
            // The participants of this query
            const queryParticipants = participants.rows.filter(
                participant => participant.query_id === query.id
            ).map(final => final.creator_id);
            const queryLabels = labels.rows.filter(
                label => label.query_id === query.id
            ).map(final => final.label_id);
            // The most recent message for this query
            const queryLatest = latest.rows.find(
                latestMessage => latestMessage.query_id === query.id
            );
            return {
                ...query,
                initiator: queryInitiator,
                participants: queryParticipants,
                latestMessage: queryLatest,
                labels: queryLabels
            };
        });
    }
}

module.exports = queries;
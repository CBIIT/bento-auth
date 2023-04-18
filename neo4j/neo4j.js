const neo4j = require('neo4j-driver');

class Neo4jDriver {
    constructor(uri, user, password) {
        this.connection = neo4j.driver(
            uri,
            neo4j.auth.basic(user, password),
            {disableLosslessIntegers: true}
        );
    }

    async executeQuery(parameters, cypher, returnLabel) {
        const session = this.connection.session();
        const tx = session.beginTransaction();
        try {
            const result = await tx.run(cypher, parameters);
            return result.records.map(record => {
                return record.get(returnLabel)
            })
        } catch (error) {
            throw error;
        } finally {
            try {
                await tx.commit();
            } catch (err) {
            }
            await session.close();
        }
    }
}

module.exports = {
    Neo4jDriver
};

class Neo4jService {

    constructor(neo4j) {
        this.neo4j = neo4j;
    }

    async getUserTokenUUIDs(parameters) {
        const cypher =
        `
        MATCH (user:User)
        WHERE user.email = $email AND user.IDP = $IDP
        OPTIONAL MATCH (user)<-[:of_token]-(token:Token)
        RETURN COLLECT(DISTINCT token.uuid) as uuids
        `
        const result = await this.neo4j.executeQuery(parameters, cypher, 'uuids');
        return result[0];
    }
}

module.exports = {
    Neo4jService
};

const config = require('../config');
const neo4j = require('neo4j-driver');

const neo4jConnection = neo4j.driver(
    config.neo4j_uri,
    neo4j.auth.basic(config.neo4j_user, config.neo4j_password),
    {disableLosslessIntegers: true}
);

module.exports = {
    neo4jConnection
};
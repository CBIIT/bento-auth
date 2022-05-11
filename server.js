const express = require('express');
const {graphqlHTTP} = require('express-graphql');
const {buildSchema} = require('graphql');
const db = require('./database/data-interface');
const auth = require('./authentication/auth');
const {authorize, authorizeAdmin} = require('./authorization/permissions')
const {error} = require("neo4j-driver");


const currentUserEmail = auth.getCurrentUser();

//Read schema from schema.graphql file
const schema = buildSchema(require("fs").readFileSync("graphql/schema.graphql", "utf8"));

//Query logic
const root = {
    getMyUser: () => {
        return db.getMyUser(currentUserEmail)
    },
    listUsers: () => {
        return db.listUsers(currentUserEmail)
    },
    registerUser: (args) => {
        return db.registerUser(args)
    }
};

const app = express();
app.use('/graphql', graphqlHTTP({
    schema,
    rootValue: root,
    graphiql: true,
}));
app.listen(4000);
console.log('Running Graphql API on localhost:4000/graphql')
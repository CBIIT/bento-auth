const express = require('express');
const {graphqlHTTP} = require('express-graphql');
const {buildSchema} = require('graphql');
const db = require('./data-operations');
const auth = require('./auth');
const {authorize, authorizeAdmin} = require('./permissions')


const currentUser = auth.getCurrentUser();

//Read schema from schema.graphql file
const schema = buildSchema(require("fs").readFileSync("schema.graphql", "utf8"));

//Query logic
const root = {
    getMyUser: () => {
        if (authorize(currentUser)){
            return db.getMyUser(currentUser)
        }
    },
};

const app = express();
app.use('/graphql', graphqlHTTP({
    schema,
    rootValue: root,
    graphiql: true,
}));
app.listen(4000);
console.log('Running Graphql API on localhost:4000/graphql')
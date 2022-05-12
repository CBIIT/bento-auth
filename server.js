const express = require('express');
const {graphqlHTTP} = require('express-graphql');
const {buildSchema} = require('graphql');
const db = require('./database/data-interface');
const {getCurrentUser} = require('./authentication/auth');


const currentUserEmail = getCurrentUser();

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
    },
    updateMyUser: (args) => {
        return db.updateMyUser(args)
    },
    approveUser: (args) => {
        return db.approveUser(args)
    },
    rejectUser: (args) => {
        return db.rejectUser(args)
    },
    deleteUser: (args) => {
        return db.deleteUser(args)
    },
    disableUser: (args) => {
        return db.disableUser(args)
    },
    editUser: (args) => {
        return db.editUser(args)
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
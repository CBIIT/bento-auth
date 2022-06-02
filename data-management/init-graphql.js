const {buildSchema} = require('graphql');
const data_interface = require('./data-interface');
const {graphqlHTTP} = require("express-graphql");
const {errorType} = require('./graphql-api-constants');

//Read schema from schema.graphql file
const schema = buildSchema(require("fs").readFileSync("graphql/schema.graphql", "utf8"));

//Query logic
const root = {
    getMyUser: data_interface.getMyUser,
    listUsers: data_interface.listUsers,
    registerUser: data_interface.registerUser,
    updateMyUser: data_interface.updateMyUser,
    approveUser: data_interface.approveUser,
    rejectUser: data_interface.rejectUser,
    deleteUser: data_interface.deleteUser,
    disableUser: data_interface.disableUser,
    editUser: data_interface.editUser,
};

module.exports = graphqlHTTP((req, res) => {
    return {
        graphiql: true,
        schema: schema,
        rootValue: root,
        context: {
            session: req.session
        },
        customFormatErrorFn: (error) => {
            res.status(errorType[error.message].statusCode);
            return error;
        }
    }
});

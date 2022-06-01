const {buildSchema} = require('graphql');
const data_interface = require('./data-interface');
const {graphqlHTTP} = require("express-graphql");
const {apiErrors} = require('./data-interface')

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

module.exports = graphqlHTTP((req, res, params) => {
    return {
        graphiql: true,
        schema: schema,
        rootValue: root,
        context: {
            session: req.session
        },
        customFormatErrorFn: (error) => {
            let message = error.message;
            if (message === apiErrors.INVALID_IDP){
                res.status(400);
            }
            else if (message === apiErrors.NOT_LOGGED_IN){
                res.status(401);
            }
            else if (message === apiErrors.NOT_UNIQUE){
                res.status(409);
            }
            else if (message === apiErrors.MISSING_INPUTS){
                res.status(400);
            }
            else if (message === apiErrors.NOT_AUTHORIZED){
                res.status(403);
            }
            else {
                res.status(400);
            }
            return error;
        }
    }
});

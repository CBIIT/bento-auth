const {neo4jConnection} = require('./neo4j-connections');
const {getUserID, logEvent} = require("../bento-event-logging/neo4j/neo4j-operations");
const {LoginEvent} = require("../bento-event-logging/model/login-event");

const storeLoginEvent = async function(userEmail, userIDP){
    let userID = await getUserID(neo4jConnection, userEmail, userIDP);
    if (userID === undefined){
        userID = 'Not yet registered';
    }
    const loginEvent = new LoginEvent(userID, userEmail, userIDP);
    await logEvent(neo4jConnection, loginEvent);
}

module.exports = {
    storeLoginEvent
};

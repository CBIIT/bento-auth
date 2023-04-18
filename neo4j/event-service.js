const {getUserID, logEvent} = require("../bento-event-logging/neo4j/neo4j-operations");
const {LoginEvent} = require("../bento-event-logging/model/login-event");
const {LogoutEvent} = require("../bento-event-logging/model/logout-event");

class EventService {

    constructor(neo4j) {
        this.neo4j = neo4j.connection;
    }

    async storeLoginEvent(userEmail, userIDP){
        let userID = await getUserID(this.neo4j, userEmail, userIDP);
        if (userID === undefined){
            userID = 'Not yet registered';
        }
        const loginEvent = new LoginEvent(userID, userEmail, userIDP);
        await logEvent(this.neo4j, loginEvent);
    }

    async storeLogoutEvent(userEmail, userIDP){
        let userID = await getUserID(this.neo4j, userEmail, userIDP);
        const logoutEvent = new LogoutEvent(userID, userEmail, userIDP);
        await logEvent(this.neo4j, logoutEvent);
    }
}

module.exports = {
    EventService
};

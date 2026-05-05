class mySQLDriver {
    constructor(url, user, password,port) {
        this.connection =  {
        userName: user,
        password: password,
        url: url,
        port: port
            //anything else needed to connect
        }
    }
}
module.exports = {
    mySQLDriver
};
module.exports = class UserInfo {
    constructor(firstName, email, idp) {
        this.firstName = firstName;
        this.email = email;
        this.idp = idp;
    }

    getUserInfo() {
        return {name: this.firstName, email: this.email, idp: this.idp};
    }
}
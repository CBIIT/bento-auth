const {STANDARD, INITIALIZED} = require("../constants/user-constant");
module.exports = class UserInfo {
    constructor(firstName, lastName, email, idp) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.idp = idp;
    }

    getLoginUser() {
        return {name: this.firstName, email: this.email, idp: this.idp};
    }

    getRegisterUser() {
        return {firstName: this.firstName, lastName: this.lastName, email: this.email, IDP: this.idp, role: STANDARD, status: INITIALIZED, organization: '', acl: []}
    }

    getEmail() { return this.email }
    getIDP() { return this.idp }
}
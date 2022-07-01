class UserInfo {
    constructor(firstName, email, role) {
        this.firstName = firstName;
        this.email = email;
        this.role = role;
    }

    getFirstName() {
        return this.firstName;
    }

    getRole() {
        return this.role;
    }

    getUserInfo() {
        return {name: this.firstName, email: this.email};
    }
}


class UserInfoBuilder {
    constructor(firstName, email) {
        this.firstName = firstName;
        this.email = email;
    }

    setRole(role) {
        this.role = role;
        return this
    }

    static createUser(firstName, email) {
        return new UserInfoBuilder(firstName, email)
            .build()
    }

    static createUserFromSession(session) {
        return new UserInfoBuilder(session.userInfo.name, session.userInfo.email)
            .setRole(session.userInfo.role)
            .build();
    }

    build() {
        return new UserInfo(this.firstName, this.email, this.role);
    }
}

module.exports = UserInfoBuilder
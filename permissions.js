module.exports = {
    authorize(user){
        return user.status === 'approved';
    },
    authorizeAdmin(user){
        return this.authorize(user) && user.role === 'admin';
    }
};

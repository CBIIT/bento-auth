
class UserService{
    constructor(dataService) {
        this.dataService = dataService;
    }

    getUserTokenUUIDs(userInfo) {
        if (!userInfo?.email || !userInfo?.IDP) {
            return [];
        }
        return this.dataService.getUserTokenUUIDs({
            email: userInfo.email,
            IDP: userInfo.IDP
        });
    }
}

module.exports = {
    UserService
};

const {Neo4jService} = require("../../neo4j/neo4j-service.js");
const {UserService} = require("../../services/user-service");

jest.mock("../../neo4j/neo4j-service.js");
const neo4jService = new Neo4jService();
describe('get user token uuids tests', () => {

    const userService = new UserService(neo4jService);

    test('invalid userInfo', () => {
        let userInfo = {}
        expect(userService.getUserTokenUUIDs(userInfo)).toStrictEqual([]);
        userInfo.email = "placeholderemail";
        expect(userService.getUserTokenUUIDs(userInfo)).toStrictEqual([]);
        userInfo.IDP = "placeholderIDP";
        userInfo.email = undefined;
        expect(userService.getUserTokenUUIDs(userInfo)).toStrictEqual([]);
    });

    test('valid userInfo', () => {
        let userInfo = {
            email: 'placeholderemail',
            IDP: 'placeholderIDP'
        };
        const response = ['uuid'];
        neo4jService.getUserTokenUUIDs.mockImplementation(() => {
           return response;
        });
        expect(userService.getUserTokenUUIDs(userInfo)).toStrictEqual(response);
    });
});
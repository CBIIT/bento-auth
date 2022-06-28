const {authFileACL} = require("../services/file-auth");

describe('Util Test', () => {
    test('/file acl array & user acl array compare test', () => {
        const test = [
            {userAcl: ['Open'], fileAcl: "['Open']", result: true},
            {userAcl: ['Open'], fileAcl: "['Open', 'Closed']", result: true},
            {userAcl: ['Open'], fileAcl: "['Closed']", result: false},
            {userAcl: [], fileAcl: "['Open']", result: false},
            {userAcl: ['Open', 'Closed'], fileAcl: "['Closed']", result: true},
            {userAcl: null, fileAcl: "", result: false},
            {userAcl: null, fileAcl: null, result: false},
            {userAcl: [], fileAcl: null, result: false},
        ];

        for (let t of test) {
            const result = authFileACL(t.userAcl, t.fileAcl);
            expect(result).toBe(t.result);
        }
    });
});
const {strToArr} = require('../util/file-util')

describe('Util Test', () => {
    test('/acl authentication test', async () => {
        const test = [
            {str: "['Open']", result: 1},
            {str: "['Open'", result: 0},
            {str: "['Open', 'Closed']", result: 2},
            {str: undefined, result: 0}
        ];

        for (let i of test) {
            const result = strToArr(i.str);
            expect(result.length).toBe(i.result);
        }
    });
});
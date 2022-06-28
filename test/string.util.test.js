const {isCaseInsensitiveEqual} = require('../util/string-util')
const {strToArr} = require("../util/file-util");

describe('Util Test', () => {
    test('/string case insensitive equal', () => {
        const test = [
            {src: "nih", target: 'NIH',result: true},
            {src: "NIH", target: 'NiH',result: true},
            {src: "nih", target: 'Nih',result: true},
            {src: "nih", target: '',result: false},
            {src: "nih", target: null,result: false}
        ];

        for (let t of test) {
            const result = isCaseInsensitiveEqual(t.src, t.target);
            expect(result).toBe(t.result);
        }
    });
});

describe('File String to Array Test', () => {
    test('/acl authentication test', () => {
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
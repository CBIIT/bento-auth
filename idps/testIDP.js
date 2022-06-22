const config = require('../config');

module.exports = {
    login: (_) => {
        const tokens = {
            idToken: 'test id token'
        };
        const name = 'Test Name';
        const email = config.TEST_EMAIL;
        return {name, tokens, email};
    },
    authenticated: (tokens) => {
        return (tokens.idToken === 'test id token');
    }
}
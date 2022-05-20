const {getToken, verifyIdToken} = require("./google-oauth2-tokens");

let client = {
    login: async (code) => {
        const tokens = await getToken(code);
        const payload = await verifyIdToken(tokens);
        const name = payload.given_name;
        return { name, tokens };
    },
    authenticated: async (tokens) => {
        try {
            if (tokens) {
                const payload = await verifyIdToken(tokens);
                return true;
            } else {
                console.log('No tokens found!');
                return false;
            }

        } catch (e) {
           console.log(e);
           return false;
        }
    }
}

module.exports = client;
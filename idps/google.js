const { google } = require('googleapis');

const client_id = process.env['CLIENT_ID']
const client_secret = process.env['CLIENT_SECRET']
const redirect_url = process.env['REDIRECT_URL']


let client = {
    login: async (code) => {
        try {
            const oauth2Client = new google.auth.OAuth2(
                client_id,
                client_secret,
                redirect_url
            );

            const {tokens} = await oauth2Client.getToken(code)
            return tokens;
        } catch (e) {
            console.log(e);
        }
    }
}

module.exports = client;
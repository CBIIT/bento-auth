const { Issuer, Strategy, generators } = require('openid-client');
const crypto = require("crypto");
const { codeVerifier, codeChallenge, nonce } = generators;

// async function createOAuthStrategy({ baseUrl, clientId, clientSecret, redirectUris, params}) {
//   const { Client } = await Issuer.discover(baseUrl);
//
//   const client = new Client({
//     client_id: clientId,
//     client_secret: clientSecret,
//     redirect_uris: redirectUris,
//     response_types: ['code'],
//   });
//
//   return new Strategy({ client, params }, async (tokenSet, done) => {
//     const user = await client.userinfo(tokenSet);
//     done(null, user);
//   });
// }

async function createPkceStrategy({ baseUrl, clientId, redirectUris, params }) {
  const { Client } = await Issuer.discover(baseUrl);

  const client = new Client({
    client_id: clientId,
    redirect_uris: redirectUris,
    response_types: ['code'],
    token_endpoint_auth_method: 'none',
  });

  params = {
    code_challenge: codeChallenge(codeVerifier()),
    code_challenge_method: 'S256',
    nonce: randomString(32),
    state: randomString(32),
    ...params,
  };

  return new Strategy({ client, params }, async (tokenSet, userinfo, done) => {
    // const user = await client.userinfo(tokenSet);
    console.log('id_token:'+ tokenSet.id_token);
    userinfo.token = tokenSet.id_token; // required for RP-Initiated Logout
    userinfo.state = params.state; // required for RP-Initiated Logout
    done(null, userinfo);
  });
}

function randomString(length) {
  return crypto.randomBytes(length).toString('hex'); // source: https://github.com/18F/fs-permit-platform/blob/c613a73ae320980e226d301d0b34881f9d954758/server/src/util.es6#L232-L237
}


module.exports = {
  // createOAuthStrategy,
  createPkceStrategy,
};

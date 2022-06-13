const nodeFetch = require("node-fetch");
const config = require("../config");
const idpClient = require("../idps");

exports.nihLogout = async (req, res) => {
    try {
        const response = await nodeFetch(config.nih.LOGOUT_URL, {
            method: 'POST',
            headers: {
                'Authorization': 'Basic ' + Buffer.from(config.nih.CLIENT_ID + ':' + config.nih.CLIENT_SECRET).toString('base64')
            },
            body: new URLSearchParams({
                id_token: req.session.tokens,
            })
        });
        const jsonResponse = await response.json();
        console.log('jsonResponse' + jsonResponse);
        if (jsonResponse.session_status) this.logout(req,res);
        else throw 500;
    } catch (e) {
        console.log(e);
        res.status(500);
        res.json({error: e.message});
    }
}

exports.logout = (req, res) => {
    try {
        if (req.session) {
            req.session.destroy( (err) => {
                if (err) {
                    console.log(err);
                    return res.status(500).send({errors: err});
                }
                res.status(200).send({status: 'success'});
            });
        } else {
            return res.status(200).send({status: 'success'});
        }
    } catch (e) {
        console.log(e);
        res.status(500).json({errors: e});
    }
}

exports.authenticated = (req, res) => {
    try {
        if (req.session.tokens) {
            return res.status(200).send({status: true});
        }
        return res.status(200).send({status: false});
    } catch (e) {
        console.log(e);
        res.status(500).json({errors: e});
    }
}

exports.userInfo = async (accessToken) => {
    const response = await nodeFetch(config.nih.USERINFO_URL, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ` + accessToken
        }
    });
    return await response.json();
}

exports.nihLogin = async (req, res) => {
    const token = req.session.tokens ? req.session.tokens : await getNIHToken(req);
    const user = await this.userInfo(token);
    req.session.tokens = token;
    res.send({ user });
}


exports.googleLogin = async (req, res) => {
    const code  = req.body['code'];
    const { name, tokens } = await idpClient.login(code);
    req.session.tokens = tokens;
    res.json({ name });
}

async function getNIHToken(req) {
    const auth_code  = req.body['code'];
    const redirectUri  = req.body['redirectUri'];

    const response = await nodeFetch(config.nih.TOKEN_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
            code: auth_code,
            redirect_uri: redirectUri,
            grant_type: "authorization_code",
            client_id: config.nih.CLIENT_ID,
            client_secret: config.nih.CLIENT_SECRET,
            scope: "openid email profile"
        })
    });
    const jsonResponse = await response.json();
    return jsonResponse.access_token;
}
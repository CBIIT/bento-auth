const idpClient = require("../idps");
const {authFileWithACL} = require("../services/file-auth");
const {getNIHToken, nihLogout, nihUserInfo} = require("../services/auth");

exports.nihLogout = async (req, res) => {
    const response = await nihLogout(req);
    const jsonRes = await response.json();
    if (jsonRes.session_status) return this.logout(req,res);
    else throw 500;
}

exports.logout = (req, res) => {
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
}

function getACLFileAuth(req) {
    if (req.session.tokens && req.session.userInfo && req.headers.acl)
        return authFileWithACL(req.session.userInfo, req.headers.acl);
    return false;
}

exports.authenticated = (req, res) => {
    if (req.headers.acl) {
        return res.status(200).send({status: getACLFileAuth(req)});
    }

    if (req.session.tokens) {
        return res.status(200).send({status: true});
    }
    return res.status(200).send({status: false});
}

exports.userInfo = async (accessToken) => {
    const response = await nihUserInfo(accessToken);
    return await response.json();
}

exports.nihLogin = async (req, res) => {
    const token = req.session.tokens ? req.session.tokens : await getNIHToken(req);
    const user = await this.userInfo(token);
    // @Austin
    // TODO Database access logic after login success
    // Store email address or any identity
    // TODO temporary acl values
    req.session.userInfo = {idp: "NIH", email: user.email, acl: ["Open"]}
    req.session.tokens = token;
    res.send({ user });
}

exports.googleLogin = async (req, res) => {
    const code  = req.body['code'];
    const { name, tokens } = await idpClient.login(code);
    // @Austin
    // TODO Database access logic after login success
    // Store email address or any identity
    // TODO temporary acl values
    req.session.userInfo = {idp: "google", email: name, acl: ["Open"]}
    req.session.tokens = tokens;
    res.json({ name });
}

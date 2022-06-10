const nodeFetch = require("node-fetch");
const config = require("../config");
exports.logout = (req, res, next) => {
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
        } else {
            return res.status(200).send({status: false});
        }
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
    const jsonResponse = await response.json();
    return jsonResponse;
}
const idpClient = require('../idps');
const config = require("../config");

exports.login = async (req, res, next) => {
    try {
        const code = req.body['code'];
        const { name, tokens } = await idpClient.login(code);
        req.session.tokens = tokens;
        res.json({ name });
    } catch (e) {
        console.log(e);
        if (e.code && parseInt(e.code)) {
            res.status(e.code);
        } else {
            res.status(500);
        }
        res.json({error: e.message});
    }
}

exports.logout = async (req, res, next) => {
    try {
        if (req.session) {
            req.session.destroy( (err) => {
                if (err) {
                    console.log(err);
                    return res.status(500).send({errors: err});
                }
                res.status(200).send({status: 'success'});
            });
        }
        return res.status(200).send({status: 'success'});

    } catch (e) {
        console.log(e);
        res.status(500).json({errors: e});
    }
}

exports.authenticated = async (req, res, next) => {
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

exports.ping = (req, res, next) => {
    res.send(`pong`);
}

exports.version = async (req, res, next) => {
    res.json({
        version: config.version,
        date: config.date
    });
}
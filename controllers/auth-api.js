const {nihLogout} = require("../services/auth");
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
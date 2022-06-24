const config = require("../config");
exports.ping = (req, res) => {
    res.send(`pong`);
}

exports.version = async (req, res) => {
    res.json({
        version: config.version,
        date: config.date
    });
}
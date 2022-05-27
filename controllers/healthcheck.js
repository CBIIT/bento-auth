const config = require("../config");
exports.ping = (req, res, next) => {
    res.send(`pong`);
}

exports.version = async (req, res, next) => {
    res.json({
        version: config.version,
        date: config.date
    });
}
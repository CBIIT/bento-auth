const fs = require("fs");
const path = require("path");
const logger = require("morgan");

function withAsync(fn) {
    return async (request, response, next) => {
        try {
            return await fn(request, response, next);
        } catch (error) {
            next(error);
        }
    };
}

function createLogStream(dirName) {
    const LOG_FOLDER = 'logs';
    if (!fs.existsSync(path.join(dirName, LOG_FOLDER))) {
        fs.mkdirSync(path.join(dirName, LOG_FOLDER));
    }
    // create a write stream (in append mode)
    const accessLogStream = fs.createWriteStream(path.join(dirName, LOG_FOLDER, 'access.log'), { flags: 'a'})
    return logger('combined', { stream: accessLogStream });
}

module.exports = {
    withAsync,
    createLogStream
};
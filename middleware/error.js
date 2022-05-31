const createError = require("http-errors");
const fs = require('fs');
const path = require("path");
const logger = require("morgan");


function throwError(req, res, next) {
    next(createError(404));
}

function errorHandler(err, req, res, next) {
        // set locals, only providing error in development
        res.locals.message = err.message;
        res.locals.error = req.app.get('env') === 'development' ? err : {};

        // render the error page
        res.status(err.status || 500);
        res.json(res.locals.message);
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
    errorHandler,
    throwError,
    createLogStream
};
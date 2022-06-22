function withAsync(fn) {
    return async (request, response, next) => {
        try {
            return await fn(request, response, next);
        } catch (error) {
            next(error);
        }
    };
}

module.exports = {
    withAsync
};
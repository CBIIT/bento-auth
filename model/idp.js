const config = require('../config');

const GOOGLE = 'GOOGLE'
const NIH = 'NIH';

module.exports = class IDP {
    constructor(type, url) {
        this.type = type;
        this.url = url;
    }

    static createIDP(type, url) {
        // idp, url
        if (type && url) return new IDP(type, url);
        // no idp, url
        if (!type && url) return new IDP(config.idp, url);
        // idp, no url
        if (type && !url) return new IDP(type, this.getRedirectUri(type));
        // no idp, no url
        return new IDP(config.idp, 'http://localhost:4010');
    }

    static getRedirectUri(idp) {
        if (!idp) return 'http://localhost:4010';
        if (idp.toUpperCase() === GOOGLE)
            return config.google.REDIRECT_URL;
        if (idp.toUpperCase() === NIH)
            return config.nih.REDIRECT_URL;

        return 'http://localhost:4010';
    }

    getType() {
        return this.type;
    }

    getUrl() {
        return this.url;
    }
}
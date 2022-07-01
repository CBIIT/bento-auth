const {isCaseInsensitiveEqual} = require("../util/string-util");

const GOOGLE = 'GOOGLE'
const NIH = 'NIH';

module.exports = class IDP {
    constructor(type, url) {
        this.type = type;
        this.url = url;
    }

    static createIDP(type, url) {
        const defaultIdp = this.defaultIDP();
        if (type && url) return new IDP(type, url);
        // idp, no url
        if (type && !url) return new IDP(type, this.getRedirectUri(type));
        // no idp, url
        if (!type && url) return new IDP(defaultIdp, url);
        // no idp, no url
        return new IDP(defaultIdp, this.getRedirectUri(defaultIdp));
    }

    static getRedirectUri(idp) {
        if (isCaseInsensitiveEqual(idp, NIH)) return process.env.NIH_REDIRECT_URL;
        // by default Google redirect url
        return process.env.GOOGLE_REDIRECT_URL ? process.env.GOOGLE_REDIRECT_URL : 'http://localhost:4010';
    }

    static defaultIDP() {
        return process.env.IDP ? process.env.IDP.toLowerCase() : GOOGLE.toLowerCase();
    }

    getType() {
        return this.type;
    }

    getUrl() {
        return this.url;
    }
}
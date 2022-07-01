const {isCaseInsensitiveEqual} = require("../util/string-util");
const {errorType} = require("../data-management/graphql-api-constants");

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
        const defaultIdp = this.defaultIDP();
        if (isCaseInsensitiveEqual(idp, NIH)) {
            if (!process.env.NIH_REDIRECT_URL) {
                console.error(`Please, set NIH_REDIRECT_URL in environmental variable!`)
                throw errorType.INVALID_IDP_CONFIGURATION;
            }
            return process.env.NIH_REDIRECT_URL;
        }
        else if (isCaseInsensitiveEqual(idp, GOOGLE)) {
            if (!process.env.GOOGLE_REDIRECT_URL && !isCaseInsensitiveEqual(defaultIdp, GOOGLE)) {
                console.error(`Please, set GOOGLE_REDIRECT_URL in environmental variable!`)
                throw errorType.INVALID_IDP_CONFIGURATION;
            }
        }
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
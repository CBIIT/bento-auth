const IDP = require("../model/idp");

describe('IDP Test', () => {

    const googleRedirectURL = 'localhost:4010/GOOGLE';
    const nihRedirectURL = 'localhost:4010/NIH'
    const defaultIDP = 'google';

    beforeEach(() => {
        process.env.GOOGLE_REDIRECT_URL = googleRedirectURL;
        process.env.NIH_REDIRECT_URL = nihRedirectURL;
        process.env.IDP = defaultIDP;
    });
    // When idp, url present in the body => provided idp, url
    test('/idp, url', () => {
        const test = {idp: "google", url: 'http://localhost:3000', expectedIdp: 'google', expectedUrl: 'http://localhost:3000'};
        let idp = IDP.createIDP(test.idp, test.url);
        expect(idp.type).toBe(test.expectedIdp);
        expect(idp.url).toBe(test.expectedUrl);

    });

    // When no idp, url present in the body => default idp, url
    test('/no idp, url', () => {
        const test = {idp: null, url: 'http://localhost:3000', expectedIdp: defaultIDP, expectedUrl: 'http://localhost:3000'};
        let idp = IDP.createIDP(test.idp, test.url);
        expect(idp.type).toBe(test.expectedIdp);
        expect(idp.url).toBe(test.expectedUrl);

    });

    // When idp, no url => NIH, NIH redirect url
    test('/NIH, no url', () => {
        const test = {idp: "NIH", url: null, expectedIdp: 'NIH', expectedUrl: nihRedirectURL};
        let idp = IDP.createIDP(test.idp, test.url);
        expect(idp.type).toBe(test.expectedIdp);
        expect(idp.url).toBe(test.expectedUrl);
    });

    // When idp, url => default idp, expected url
    test('/no idp, url', () => {
        const test = {idp: null, url: 'http://localhost:3000', expectedIdp: defaultIDP, expectedUrl: 'http://localhost:3000'};
        let idp = IDP.createIDP(test.idp, test.url);
        expect(idp.type).toBe(test.expectedIdp);
        expect(idp.url).toBe(test.expectedUrl);
    });

    // When no idp and no url in the body and no google redirect url => default idp and http://localhost:4010
    test('/no idp, no url no google environment', () => {
        delete process.env.GOOGLE_REDIRECT_URL;
        const test = {idp: null, url: null, expectedIdp: defaultIDP, expectedUrl: 'http://localhost:4010'};
        let idp = IDP.createIDP(test.idp, test.url);
        expect(idp.type).toBe(test.expectedIdp);
        expect(idp.url).toBe(test.expectedUrl);
    });

    test('/test redirect function', () => {
        const tests = [
            // by default Google redirecting returns
            {idp: null, expectedUrl: googleRedirectURL},
            {idp: "GOOGLE", expectedUrl: googleRedirectURL},
            {idp: 'NIH', expectedUrl: nihRedirectURL},
        ];
        for (let t of tests) {
            let url = IDP.getRedirectUri(t.idp);
            expect(url).toBe(t.expectedUrl);
        }
    });
});

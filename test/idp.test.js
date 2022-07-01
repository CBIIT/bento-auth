const IDP = require("../model/idp");

describe('IDP Test', () => {

    const googleRedirectURL = 'localhost:4010/GOOGLE';
    const nihRedirectURL = 'localhost:4010/NIH'
    const defaultIDP = 'google';
    process.env.GOOGLE_REDIRECT_URL = googleRedirectURL;
    process.env.NIH_REDIRECT_URL = nihRedirectURL;
    process.env.IDP = defaultIDP;

    test('/IDP cases', () => {
        const tests = [
            // default idp Google, Google redirecting url should return
            {idp: null, url: null, expectedIdp: defaultIDP, expectedUrl: googleRedirectURL},
            {idp: "NIH", url: null, expectedIdp: 'NIH', expectedUrl: nihRedirectURL},
            {idp: "LOGIN.GOV", url: 'http://localhost:3000', expectedIdp: 'LOGIN.GOV', expectedUrl: 'http://localhost:3000'},
            {idp: "GOOGLE", url: null, expectedIdp: 'GOOGLE', expectedUrl: googleRedirectURL},
            {idp: null, url: 'http://localhost:3000', expectedIdp: defaultIDP, expectedUrl: 'http://localhost:3000'},
        ];

        for (let t of tests) {
            let idp = IDP.createIDP(t.idp, t.url);
            expect(idp.type).toBe(t.expectedIdp);
            expect(idp.url).toBe(t.expectedUrl);
        }
    });

    test('/IDP redirect url test', () => {

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

    test('/IDP redirect url test', () => {
        process.env.GOOGLE_REDIRECT_URL = null;
        const tests = [
            // by default Google redirecting returns
            {idp: null, expectedUrl: 'http://localhost:4010'},
        ];

        for (let t of tests) {
            let url = IDP.getRedirectUri(t.idp);
            expect(url).toBe(t.expectedUrl);
        }
    });


});
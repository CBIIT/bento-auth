const {isCaseInsensitiveEqual} = require('../util/string-util')
const IDP = require("../model/idp");
const config = require("../config");

describe('IDP Test', () => {
    test('/IDP cases', () => {

        const configIdp = 'login_gov';
        Object.defineProperty(config, 'idp', {
            get: jest.fn(() => configIdp)
        });

        const nihRedirectURL = 'localhost:4010/NIH';
        Object.defineProperty(config.nih, 'REDIRECT_URL', {
            get: jest.fn(() => nihRedirectURL)
        });

        const googleRedirectURL = 'localhost:4010/GOOGLE';
        Object.defineProperty(config.google, 'REDIRECT_URL', {
            get: jest.fn(() => googleRedirectURL)
        });

        const tests = [
            {idp: null, url: null, expectedIdp: configIdp, expectedUrl: 'http://localhost:4010'},
            {idp: "NIH", url: null, expectedIdp: 'NIH', expectedUrl: nihRedirectURL},
            {idp: "GOOGLE", url: 'http://localhost:3000', expectedIdp: 'GOOGLE', expectedUrl: 'http://localhost:3000'},
            {idp: "GOOGLE", url: null, expectedIdp: 'GOOGLE', expectedUrl: googleRedirectURL},
            {idp: null, url: 'http://localhost:3000', expectedIdp: configIdp, expectedUrl: 'http://localhost:3000'},
        ];

        for (let t of tests) {
            let idp = IDP.createIDP(t.idp, t.url);
            expect(idp.type).toBe(t.expectedIdp);
            expect(idp.url).toBe(t.expectedUrl);
        }
    });

    test('/IDP redirect url test', () => {

        const nihRedirectURL = 'localhost:4010/NIH';
        Object.defineProperty(config.nih, 'REDIRECT_URL', {
            get: jest.fn(() => nihRedirectURL)
        });

        const googleRedirectURL = 'localhost:4010/GOOGLE';
        Object.defineProperty(config.google, 'REDIRECT_URL', {
            get: jest.fn(() => googleRedirectURL)
        });

        const tests = [
            {idp: null, expectedUrl: 'http://localhost:4010'},
            {idp: "GOOGLE", expectedUrl: googleRedirectURL},
            {idp: 'NIH', expectedUrl: nihRedirectURL},
        ];

        for (let t of tests) {
            let url = IDP.getRedirectUri(t.idp);
            expect(url).toBe(t.expectedUrl);
        }
    });




});
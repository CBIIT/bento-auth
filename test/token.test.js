const {createToken, verifyToken, verifyTokenCallback} = require("../services/tokenizer");

describe('tokenizer Test', () => {
    test('/token is not null', async () => {
        const token = await createToken({email: "bento@gmail.com"});
        expect(token).not.toBeNull();
    });

    test('/verify token', async () => {
        const token = await createToken({});
        const isValid = await verifyToken(token);
        expect(isValid).toBe(true);
    });

    test('/throw invalid token error', async () => {
        const isValid = await verifyToken("random");
        expect(isValid).toBe(false);
    });
});
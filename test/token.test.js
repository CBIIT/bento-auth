const {createToken, verifyToken, verifyTokenCallback} = require("../services/tokenizer");

describe('tokenizer Test', () => {
    test('/token is not null', async () => {
        const token = await createToken();
        expect(token).not.toBeNull();
    });

    test('/verify token', async () => {
        const token = await createToken();
        await verifyToken(token, (error, decoded) => {
            expect(decoded).not.toBeNull();
            expect(decoded).not.toBeUndefined();
        });
    });

    test('/throw invalid token error', async () => {
        await verifyToken("random", (error, decoded) => {
            expect(decoded).toBeUndefined();
        });
    });

    test('/verify valid token with callback', async () => {
        const token = await createToken();
        await verifyToken(token, verifyTokenCallback);
    });

    test('/invalid token throw error callback', async () => {
        await expect(verifyToken("random", verifyTokenCallback))
            .rejects
            .toThrow("invalid token");
    });
});
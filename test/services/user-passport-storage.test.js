const { UserService } = require('../../services/user-service');

describe('UserService passport persistence', () => {
    test('persistUserPassportJWT calls data layer with required fields', async () => {
        const dataService = {
            upsertUserPassportJWT: jest.fn().mockResolvedValue(true)
        };

        const svc = new UserService(dataService);
        await svc.persistUserPassportJWT({
            email: 'u@example.org',
            IDP: 'ras',
            passportJWT: 'passport.jwt'
        });

        expect(dataService.upsertUserPassportJWT).toHaveBeenCalledTimes(1);
        expect(dataService.upsertUserPassportJWT).toHaveBeenCalledWith({
            email: 'u@example.org',
            idp: 'ras',
            passportJWT: 'passport.jwt'
        });
    });
});

module.exports = function (app) {
    let passport = require('passport');
    app.use(passport.initialize());
    app.use(passport.session());

    passport.serializeUser(function(user, done) {
        done(null, user);
    });

    passport.deserializeUser(function(user, done) {
        done(null, user);
    });

    const GoogleStrategy = require('passport-google-oauth20').Strategy;
    passport.use(new GoogleStrategy(
        {
            clientID: process.env.CLIENT_ID, // 구글 로그인에서 발급받은 REST API 키
            clientSecret: process.env.CLIENT_SECRET,
            callbackURL: process.env.GOOGLE_CALLBACK_URL, // 구글 로그인 Redirect URI 경로
            passReqToCallback: true
        },
        function(request, accessToken, refreshToken, profile, done) {
            return done(null, profile);
        }));
    return passport;
}
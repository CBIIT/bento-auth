const {createPkceStrategy} = require("./govLoginStrategies");
const config = require("../config");
module.exports = async function (app) {
    let passport = require('passport');
    app.use(passport.initialize());
    app.use(passport.session());

    passport.serializeUser(function (user, done) {
        done(null, user);
    });

    passport.deserializeUser(function (user, done) {
        done(null, user);
    });

    // GOV LOGIN
    const strategy = await createPkceStrategy(config.login_gov);
    passport.use(config.login_gov.name, strategy);

    // GOOGLE
    const GoogleStrategy = require('passport-google-oauth20').Strategy;
    passport.use(new GoogleStrategy(
        {
            clientID: process.env.CLIENT_ID,
            clientSecret: process.env.CLIENT_SECRET,
            callbackURL: process.env.GOOGLE_CALLBACK_URL,
            passReqToCallback: true
        },
        function(request, accessToken, refreshToken, profile, done) {
            // TODO Database user check up

            return done(null, profile);
        }));
    return passport;
}
const passport = require("passport")
const LocalStrategy = require("passport-local").Strategy;
const con = require("../dbConnection/dbConnection")
const bcrypt = require("bcrypt")

passport.use(new LocalStrategy(
    {
        usernameField: 'email',
        passwordField: 'password'
    },

    async function (email, password, done) {


            const result = await con.promise().query("SELECT * FROM users WHERE email = ?", [email])

            const comparedPassword = await bcrypt.compare(password, result[0][0].password);

            if (!result[0].length) {

                return done(null, false);
            }
            if (!comparedPassword) {

                return done(null, false);
            }

            return done(null, result[0][0]);

    }
));

passport.serializeUser((user, done) => {

    if (user) {
        return done(null, user.id)
    }
    return done(null, false)
})

passport.deserializeUser( async(id, done) => {

    const result = await con.promise().query("SELECT * FROM users WHERE id = ?", [id])
    
        if (result[0].length) {
            return done(null, result[0][0]);
        }
        return done(null, false);

});




module.exports = {
    passport: passport
}
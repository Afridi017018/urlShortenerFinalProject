const passport = require("passport")
const LocalStrategy = require("passport-local").Strategy;
const con = require("../dbConnection/dbConnection")
const bcrypt = require("bcrypt")

passport.use(new LocalStrategy(
    {
        usernameField: 'email',
        passwordField: 'password'
    },

    function (email, password, done) {


        con.query("SELECT * FROM users WHERE email = ?", [email], async function (err, result) {

            const comparedPassword = await bcrypt.compare(password, result[0].password);

            if (err) {

                return done(err);
            }
            if (!result.length) {

                return done(null, false);
            }
            if (!comparedPassword) {

                return done(null, false);
            }

            return done(null, result[0]);
        });
    }
));

passport.serializeUser((user, done) => {

    if (user) {
        return done(null, user.id)
    }
    return done(null, false)
})

passport.deserializeUser((id, done) => {

    con.query("SELECT * FROM users WHERE id = ?", [id], (err, result) => {
        if (err) {
            return done(err);
        }
        if (result.length) {
            return done(null, result[0]);
        }
        return done(null, false);
    })
});




module.exports = {
    passport: passport
}
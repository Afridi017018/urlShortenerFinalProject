// const mysql = require("mysql")
const express = require("express")
require("dotenv").config()
const shortid = require("shortid")
const session = require("express-session")
const moment = require('moment-timezone');
const Ajv = require("ajv")
const ajv = new Ajv()
const loginValidator = require("../validator/loginValidator")
const creatingUrlValidator = require("../validator/creatingUrlValidator")
const updateForAuthValidator = require("../validator/updateForAuthValidator")
const customForAuthValidator = require("../validator/customForAuthValidator")
const registrationValidator = require("../validator/registrationValidator")
const shortUrlParamsValidator = require("../validator/shortUrlParamsValidator")
const adminDeleteValidator = require("../validator/adminDeleteValidator")
const { passport } = require('../passportAuth/passportAuth')
const con = require("../dbConnection/dbConnection")
const bcrypt = require("bcrypt");


const saltRounds = 10;

const app = express();


app.use(express.json())

app.use(session({
    secret: process.env.secret,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }


}))

app.use(passport.initialize())
app.use(passport.session())



app.get("/url/:short_url", async (req, res) => {

    const isValid = ajv.compile(shortUrlParamsValidator)(req.params)

    if (!isValid) {
        return res.status(400).json({ "message": "Invalid input type!" })
    }

    const { short_url } = req.params;
    const current_date = moment().tz('Asia/Dhaka').format('YYYY-MM-DDTHH:mm:ss');

    const result = await con.promise().query("SELECT redirect_url,expire_at From urls WHERE short_url = ?", [short_url])

    if (result[0].length < 1)
        return res.status(400).json({ "message": "Invalid URL" })

    if ((result[0].length > 0 && result[0][0].expire_at > current_date) || !result[0][0].expire_at) {
        res.redirect(result[0][0].redirect_url)
    }

    else {
        res.status(400).json({ "message": "Invalid URL" })
    }



})





app.post("/url", async (req, res) => {

    const isValid = ajv.compile(creatingUrlValidator)(req.body);

    if (!isValid) {
        return res.status(400).json({ "message": "Invalid input type!" })
    }

    const { redirect_url } = req.body

    const short_url = shortid();


    if (req.user) {
        const user_id = req.user.id

        if (req.body.expire_days) {
            const expire_at = moment().add(req.body.expire_days, 'days').tz('Asia/Dhaka').format('YYYY-MM-DDTHH:mm:ss');

            await con.promise().query("INSERT INTO urls(short_url,redirect_url,user_id,expire_at) VALUES (?,?,?,?)", [short_url, redirect_url, user_id, expire_at])

            res.json({ "user_id": user_id, "short_url": short_url, "redirect_url": redirect_url, "expire_at": expire_at })

        }


        else {
            await con.promise().query("INSERT INTO urls(short_url,redirect_url,user_id) VALUES (?,?,?)", [short_url, redirect_url, user_id])

            res.json({ "user_id": user_id, "short_url": short_url, "redirect_url": redirect_url })

        }


    }


    else {
        await con.promise().query("INSERT INTO urls(short_url,redirect_url) VALUES (?,?)", [short_url, redirect_url])

        res.json({ "short_url": short_url, "redirect_url": redirect_url })


    }

})





const isAuthenticated = (req, res, next) => {
    // console.log(req.user)

    if (req.user) {
        return next();
    }
    return res.json({ "message": "Login please!" })
}



app.get("/", isAuthenticated, (req, res) => {

    res.json({ "message": "WELCOME!!!" })

})



app.get("/show-url", isAuthenticated, async (req, res) => {
    const user_id = req.user.id;


    const result = await con.promise().query("SELECT short_url,redirect_url FROM urls WHERE user_id = ? ", [user_id])

    if (result[0].length > 0) {
        res.json(result[0])
    }

    else {
        res.json({ "message": "List is empty!" })
    }
})








app.delete('/delete-url/:short_url', isAuthenticated, async (req, res) => {

    const isValid = ajv.compile(shortUrlParamsValidator)(req.params)

    if (!isValid) {
        return res.status(400).json({ "message": "Invalid input type!" })
    }
    const { short_url } = req.params;
    const user_id = req.user.id;

    const result = await con.promise().query("SELECT * FROM urls WHERE short_url = ? AND user_id = ? ", [short_url, user_id])

    if (result[0].length > 0) {

        let deleted = result[0][0];
        await con.promise().query("DELETE from urls WHERE short_url = ? AND user_id = ? ", [short_url, user_id])
        res.json({ "message": `Short url : '${deleted.short_url}' has been successfully deleted!` });
    }

    else {
        res.status(400).json({ "message": "No such url found!" })
    }


})




app.put('/update-url', isAuthenticated, async (req, res) => {

    const isValid = ajv.compile(updateForAuthValidator)(req.body)

    if (!isValid) {
        return res.status(400).json({ "message": "Invalid input type!" })
    }

    const { old_url, new_url } = req.body;
    const user_id = req.user.id;

    const result = await con.promise().query("SELECT * FROM urls WHERE short_url = ? AND user_id = ? ", [old_url, user_id])

    if (result[0].length > 0) {

        const isExist = await con.promise().query("SELECT * FROM urls WHERE short_url =  ? ", [new_url])

        if (isExist[0].length > 0) {
            res.json({ "message": "Already have this short url,try with a new one" })
        }

        else {
            await con.promise().query("UPDATE urls SET short_url = ? WHERE short_url = ? AND user_id = ? ", [new_url, old_url, user_id])
            res.json({ "message": "Url updated!" })

        }


    }

    else {
        res.status(400).json({ "message": "No such url found!" })
    }



})



app.post("/custom-url", isAuthenticated, async (req, res) => {

    const isValid = ajv.compile(customForAuthValidator)(req.body)

    if (!isValid) {
        return res.status(400).json({ "message": "Invalid input type!" })
    }

    const { short_url, redirect_url } = req.body;


    const result = await con.promise().query("SELECT * FROM urls WHERE short_url =  ? ", [short_url])

    if (result[0].length > 0) {
        res.json({ "message": "Already have this short url,try with a new one" })
    }

    else {

        const user_id = req.user.id;

        if (req.body.expire_days) {
            const expire_at = moment().add(req.body.expire_days, 'days').tz('Asia/Dhaka').format('YYYY-MM-DDTHH:mm:ss');


            await con.promise().query("INSERT INTO urls(short_url,redirect_url,user_id,expire_at) VALUES (?,?,?,?)", [short_url, redirect_url, user_id, expire_at])

            res.json({ "user_id": user_id, "short_url": short_url, "redirect_url": redirect_url, "expire_at": expire_at })

        }


        else {

            await con.promise().query("INSERT INTO urls(short_url,redirect_url,user_id) VALUES (?,?,?)", [short_url, redirect_url, user_id])

            res.json({ "user_id": user_id, "short_url": short_url, "redirect_url": redirect_url })

        }

    }


})




app.delete("/admin-delete-url/:url_id", isAuthenticated, async (req, res) => {

    const parse = parseInt(req.params.url_id);

    const isValid = ajv.compile(adminDeleteValidator)(parse)

    if (!isValid) {
        return res.status(400).json({ "message": "Invalid input type!" })
    }

    const admin = await con.promise().query("SELECT id FROM roles WHERE role = ?", ["admin"])


    if (req.user.role_id !== admin[0][0].id) {
        return res.status(401).json({ "message": "Unauthorized access !" })
    }

    const { url_id } = req.params;

    const result = await con.promise().query("SELECT * FROM urls WHERE id = ? ", [url_id])

    if (result[0].length > 0) {

        let deleted = result[0][0];
        await con.promise().query("DELETE from urls WHERE id = ? ", [url_id])
        res.json({ "message": `Short url : '${deleted.short_url}', id : '${url_id}' has been successfully deleted!` });

    }

    else {
        res.status(400).json({ "message": "No such url found!" })
    }


})




app.post('/login', (req, res, next) => {
    const isValid = ajv.compile(loginValidator)(req.body);

    if (!isValid) {
        return res.status(400).json({ message: "Validation failed" });
    }

    next();
}, passport.authenticate('local', {
    successRedirect: "/",
    failureRedirect: '/login-failed'
}));



app.get("/login-failed", (req, res) => {
    return res.status(400).json({ "message": "Login Failed !" })
})


app.post("/registration", async (req, res) => {

    const isValid = ajv.compile(registrationValidator)(req.body)

    if (!isValid) {
        return res.status(400).json({ "message": "Invalid input type!" })
    }


    const { email, password, confirm_password } = req.body;

    if (password !== confirm_password || !password || !email) {
        res.status(400).json({ message: "Invalid Registration" })
    }

    else {

        const result = await con.promise().query("SELECT email FROM users WHERE email = ?", [email])

        if ((result[0].length > 0)) {
            res.status(400).json({ message: "Email is already registered !" });
        }

        else {
            const admin_id = await con.promise().query("SELECT id FROM roles WHERE role = ?", ["admin"])
            const customer_id = await con.promise().query("SELECT id FROM roles WHERE role = ?", ["customer"])

            let role_id = customer_id[0][0].id;

            if (req.body.admin_code && req.body.admin_code === process.env.adminCode) {
                role_id = admin_id[0][0].id;
            }


            const hashedPassword = await bcrypt.hash(password, saltRounds);
            await con.promise().query("INSERT INTO users (email,password,role_id) VALUES (? , ? , ?);", [email, hashedPassword, role_id])
            res.json({ "message": "Registered Successfully !!!" })

        }



    }
})


app.post("/logout", (req, res) => {
    req.logout((err) => {
        if (err) {
            res.json({ "message": "Error logging out" });
        } else {
            res.status(400).json({ "message": "Logged out successfully" });
        }
    });
});



setInterval(async () => {
    const currentDate = moment().tz('Asia/Dhaka').format('YYYY-MM-DDTHH:mm:ss');

    await con.promise().query("DELETE FROM urls WHERE expire_at < ?", [currentDate])

}, 10000)





module.exports = app;
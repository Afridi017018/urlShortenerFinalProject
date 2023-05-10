// const mysql = require("mysql")
const express = require("express")
require("dotenv").config()
const shortid = require("shortid")
const session = require("express-session")
const moment = require('moment-timezone');
const { passport } = require('../passportAuth/passportAuth')
const con = require("../dbConnection/dbConnection")
const bcrypt = require("bcrypt")

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





app.get("/url/:short_url", (req, res) => {
    const { short_url } = req.params;
    const current_date = moment().tz('Asia/Dhaka').format('YYYY-MM-DDTHH:mm:ss');

    con.query("SELECT redirect_url,expire_at From urls WHERE short_url = ?", [short_url], (err, result) => {
    

        if (result.length > 0 && result[0].expire_at > current_date || !result[0].expire_at) {
            res.redirect(result[0].redirect_url)
        }

        else {
            res.status(400).json({ "message": "Invalid URL" })
        }

    })

})





app.post("/url", async (req, res) => {
    const { redirect_url } = req.body


    const short_url = shortid();

    if (req.user) {
        const user_id = req.user.id

        if (req.body.expire_days) {
            const expire_at = moment().add(req.body.expire_days, 'days').tz('Asia/Dhaka').format('YYYY-MM-DDTHH:mm:ss');


            con.query("INSERT INTO urls(short_url,redirect_url,user_id,expire_at) VALUES (?,?,?,?)", [short_url, redirect_url, user_id, expire_at], (err, result) => {
                if (err) throw err;

                res.json({ "user_id": user_id, "short_url": short_url, "redirect_url": redirect_url, "expire_at": expire_at })
            })

        }


        else {
            con.query("INSERT INTO urls(short_url,redirect_url,user_id) VALUES (?,?,?)", [short_url, redirect_url, user_id], (err, result) => {
                if (err) throw err;

                res.json({ "user_id": user_id, "short_url": short_url, "redirect_url": redirect_url })
            })

        }


    }


    else {
        con.query("INSERT INTO urls(short_url,redirect_url) VALUES (?,?)", [short_url, redirect_url], (err, result) => {
            if (err) throw err;

            res.json({ "short_url": short_url, "redirect_url": redirect_url })
        })
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



app.get("/show-url", isAuthenticated, (req, res) => {
    const user_id = req.user.id;


    con.query("SELECT short_url,redirect_url FROM urls WHERE user_id = ? ", [user_id], (err, result) => {

        if (result.length > 0) {
            res.json(result)
        }

        else {
            res.json({ "message": "List is empty!" })
        }
    })

})






app.delete('/delete-url/:short_url', isAuthenticated, async (req, res) => {

    const { short_url } = req.params;
    const user_id = req.user.id;

    con.query("SELECT * FROM urls WHERE short_url = ? AND user_id = ? ", [short_url, user_id], (err, result) => {

        if (result.length > 0) {

            let deleted = result[0];
            con.query("DELETE from urls WHERE short_url = ? AND user_id = ? ", [short_url, user_id], (err, result) => {
                res.json({ "message": `Short url : '${deleted.short_url}' has been successfully deleted!` });
            })

        }

        else {
            res.status(400).json({ "message": "No such url found!" })
        }

    })
})




app.put('/update-url', isAuthenticated, async (req, res) => {

    const { old_url, new_url } = req.body;
    const user_id = req.user.id;

    con.query("SELECT * FROM urls WHERE short_url = ? AND user_id = ? ", [old_url, user_id], (err, result) => {

        if (result.length > 0) {

            con.query("SELECT * FROM urls WHERE short_url =  ? ", [new_url], (err, result) => {

                if (result.length > 0) {
                    res.json({ "message": "Already have this short url,try with a new one" })
                }

                else {
                    con.query("UPDATE urls SET short_url = ? WHERE short_url = ? AND user_id = ? ", [new_url, old_url, user_id], (err, result) => {
                        res.json({ "message": "Url updated!" })
                    })
                }

            })


        }

        else {
            res.status(400).json({ "message": "No such url found!" })
        }

    })



})



app.post("/custom-url", isAuthenticated, (req, res) => {
    const { short_url, redirect_url } = req.body;


    con.query("SELECT * FROM urls WHERE short_url =  ? ", [short_url], (err, result) => {

        if (result.length > 0) {
            res.json({ "message": "Already have this short url,try with a new one" })
        }

        else {

            const user_id = req.user.id;

            if (req.body.expire_days) {
                const expire_at = moment().add(req.body.expire_days, 'days').tz('Asia/Dhaka').format('YYYY-MM-DDTHH:mm:ss');


                con.query("INSERT INTO urls(short_url,redirect_url,user_id,expire_at) VALUES (?,?,?,?)", [short_url, redirect_url, user_id, expire_at], (err, result) => {
                    if (err) throw err;

                    res.json({ "user_id": user_id, "short_url": short_url, "redirect_url": redirect_url, "expire_at": expire_at })
                })

            }


            else {

                con.query("INSERT INTO urls(short_url,redirect_url,user_id) VALUES (?,?,?)", [short_url, redirect_url, user_id], (err, result) => {
                    if (err) throw err;

                    res.json({ "user_id": user_id, "short_url": short_url, "redirect_url": redirect_url })
                })

            }


        }

    })

})




app.delete("/admin-delete-url/:url_id", isAuthenticated, (req, res) => {

    if (req.user.role !== 'admin') {
        return res.status(400).json({ "message": "Unauthorize access !" })
    }

    const { url_id } = req.params;

    con.query("SELECT * FROM urls WHERE id = ? ", [url_id], (err, result) => {

        if (result.length > 0) {

            let deleted = result[0];
            con.query("DELETE from urls WHERE id = ? ", [url_id], (err, result) => {
                res.json({ "message": `Short url : '${deleted.short_url}', id : '${url_id}' has been successfully deleted!` });
            })

        }

        else {
            res.status(400).json({ "message": "No such url found!" })
        }

    })

})




app.post('/login', passport.authenticate('local', {
    successRedirect: "/",
    failureRedirect: '/login-failed'
}));


app.get("/login-failed", (req, res) => {
    return res.status(400).json({ "message": "Login Failed !" })
})


app.post("/registration", (req, res) => {

    const { email, password, confirm_password } = req.body;

    if (password !== confirm_password || !password || !email) {
        res.status(400).json({ message: "Invalid Registration" })
    }

    else {

        con.query("SELECT email FROM users WHERE email = ?", [email], async (err, result) => {
            if ((result.length > 0)) {
                res.status(400).json({ message: "Email is already registered !" });

            }
            else {
                let role = 'user';

                if (req.body.admin_code && req.body.admin_code === process.env.adminCode) {
                    role = 'admin'
                }

                const hashedPassword = await bcrypt.hash(password, saltRounds);
                con.query("INSERT INTO users (email,password,role) VALUES (? , ? , ?);", [email, hashedPassword, role], (err, result) => {
                    if (err) throw err;
                    res.json({ "message": "Registered Successfully !!!" })
                })
            }

        })


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



setInterval(() => {
    const currentDate = moment().tz('Asia/Dhaka').format('YYYY-MM-DDTHH:mm:ss');

    con.query("DELETE FROM urls WHERE expire_at < ?", [currentDate], (err, result) => {
    })

}, 10000)





module.exports = app;
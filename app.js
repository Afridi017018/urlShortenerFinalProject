// const mysql = require("mysql")
const express = require("express")
require("dotenv").config()
const shortid = require("shortid")
const { v4: uuidv4 } = require("uuid")
const session = require("express-session")
const { passport } = require('./passportAuth')
const con = require("./dbConnection")



const app = express();



app.use(express.json())

app.use(session({
    secret: "Askjdgaksf",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }


}))

app.use(passport.initialize())
app.use(passport.session())




app.get("/url/:shortId", (req, res) => {
    const { shortId } = req.params;
    con.query("SELECT redirectUrl From url WHERE url = ?", [shortId], (err, result) => {
        if (result.length > 0) {
            res.redirect(result[0].redirectUrl)
        }

        else
            res.send("Invalid URL")
    })

})





app.post("/url", (req, res) => {
    const { url } = req.body
    const shortId = shortid()
    const uuid = uuidv4();

    if (req.user) {
        const email = req.user.Email;
        con.query("INSERT INTO url(id,Email,url,redirectUrl) VALUES (?,?,?,?)", [uuid, email, shortId, url], (err, result) => {
            if (err) throw err;

            res.json({ "email": email, "shortUrl": shortId, "RedirectUrl": url })
        })
    }

    else {
        con.query("INSERT INTO url(id,url,redirectUrl) VALUES (?,?,?)", [uuid, shortId, url], (err, result) => {
            if (err) throw err;

            res.json({ "shortUrl": shortId, "RedirectUrl": url })
        })
    }

})




const isAuthenticated = (req, res, next) => {

    if (req.user) {
        return next();
    }
    return res.send("Login please")
}


app.get("/", isAuthenticated, (req, res) => {

    res.send("WELCOME!!!")

})


app.get("/showUrl", isAuthenticated, (req, res) => {
    const email = req.user.Email;


    con.query("SELECT url,redirectUrl FROM url WHERE Email = ? ", [email], (err, result) => {

        if (result.length > 0) {
            res.send(result)
        }

        else {
            res.send("List is empty!")
        }
    })

})

app.put('/urlUpdate', isAuthenticated, async (req, res) => {

    const { oldUrl, newUrl } = req.body;
    const email = req.user.Email;

    con.query("SELECT * FROM url WHERE url = ? AND Email = ? ", [oldUrl, email], (err, result) => {

        if (result.length > 0) {

            con.query("SELECT * FROM url WHERE url =  ? ", [newUrl], (err, result) => {

                if (result.length > 0) {
                    res.send("Already have this short url,try with a new one")
                }

                else {
                    con.query("UPDATE url SET url = ? WHERE url = ? AND Email = ? ", [newUrl, oldUrl, email], (err, result) => {
                        res.send("Url updated!")
                    })
                }

            })


        }

        else {
            res.send("No such url found!")
        }

    })



})



app.post('/login', passport.authenticate('local', {
    successRedirect: "/",
    failureRedirect: '/login'
}));


app.post("/reg", (req, res) => {

    const { email, password, confirmPass } = req.body;

    if (password !== confirmPass || !password || !email) {
        res.send("Invalid Registration")
    }

    else {

        con.query("SELECT email FROM registration WHERE email = ?", [email], (err, result) => {
            if ((result.length > 0)) {
                res.send("Email is already registered !")
            }
            else {

                con.query("INSERT INTO registration (Email,Password) VALUES (? , ?);", [email, password], (err, result) => {
                    if (err) throw err;
                    res.send("Registered Successfully !!!")
                })
            }

        })


    }
})


app.post("/logout", (req, res) => {
    req.logout((err) => {
        if (err) {
            res.send("Error logging out");
        } else {
            res.send("Logged out successfully");
        }
    });
});






module.exports = app;
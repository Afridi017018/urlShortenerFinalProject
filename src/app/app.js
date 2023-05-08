// const mysql = require("mysql")
const express = require("express")
require("dotenv").config()
const shortid = require("shortid")
// const { v4: uuidv4 } = require("uuid")
const isReachable = require('is-reachable');
const session = require("express-session")
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

    con.query("SELECT redirect_url From urls WHERE short_url = ?", [short_url], (err, result) => {
        
          if (result.length > 0) {
            res.redirect(result[0].redirect_url)
        }

        else{
            res.status(400).json({"message":"Invalid URL"})
        }
     
    })

})





app.post("/url", async(req, res) => {
    const { redirect_url } = req.body

    const reachable = await isReachable(redirect_url)
    
    if(!reachable)
    {
        res.status(400).json({"message": "Given URL is not valid"})
    }

    else{
        const short_url = shortid();

    if (req.user) {
        const user_id = req.user.id
        
        con.query("INSERT INTO urls(short_url,redirect_url,user_id) VALUES (?,?,?)", [short_url, redirect_url,user_id], (err, result) => {
            if (err) throw err;

            res.json({ "user_id": user_id,"short_url": short_url, "redirect_url": redirect_url })
        })
    }

    else {
        con.query("INSERT INTO urls(short_url,redirect_url) VALUES (?,?)", [short_url, redirect_url], (err, result) => {
            if (err) throw err;

            res.json({ "short_url": short_url, "redirect_url": redirect_url })
        })
    }
    }

})





const isAuthenticated = (req, res, next) => {
    // console.log(req.user)

    if (req.user) {
        return next();
    }
    return res.json({"message":"Login please!"})
}


app.get("/", isAuthenticated, (req, res) => {

    res.json({"message":"WELCOME!!!"})

})


app.get("/show-url", isAuthenticated, (req, res) => {
    const user_id = req.user.id;


    con.query("SELECT short_url,redirect_url FROM urls WHERE user_id = ? ", [user_id], (err, result) => {

        if (result.length > 0) {
            res.json(result)
        }

        else {
            res.json({"message":"List is empty!"})
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
                res.json({"message":  `Short url : '${deleted.short_url}' has been successfully deleted!`});
            })

        }

        else {
            res.status(400).json({"message": "No such url found!"})
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
                    res.json({"message":"Already have this short url,try with a new one"})
                }

                else {
                    con.query("UPDATE urls SET short_url = ? WHERE short_url = ? AND user_id = ? ", [new_url, old_url, user_id], (err, result) => {
                        res.json({"message":"Url updated!"})
                    })
                }

            })


        }

        else {
            res.status(400).json({"message":"No such url found!"})
        }

    })



})



app.post("/custom-url", isAuthenticated, (req, res) => {
    const { short_url , redirect_url} = req.body;

    if(!isValidUrl(redirect_url))
    {
          res.status(400).json({"message": "Given url is not valid"})
    }

    con.query("SELECT * FROM urls WHERE short_url =  ? ", [short_url], (err, result) => {

        if (result.length > 0) {
            res.json({"message":"Already have this short url,try with a new one"})
        }

        else {

            const user_id = req.user.id;
          
            con.query("INSERT INTO urls(short_url,redirect_url,user_id) VALUES (?,?,?)", [short_url, redirect_url,user_id], (err, result) => {
                if (err) throw err;

                res.json({ "user_id": user_id, "short_url": short_url, "redirect_url": redirect_url })
            })

        }

    })

})



app.post('/login', passport.authenticate('local', {
    successRedirect: "/",
    failureRedirect: '/'
}));


app.post("/registration", (req, res) => {

    const { email, password, confirm_password } = req.body;
    // console.log(req.body)

    if (password !== confirm_password || !password || !email) {
        res.status(400).json({message: "Invalid Registration"})
    }

    else {

        con.query("SELECT email FROM users WHERE email = ?", [email], async (err, result) => {
            if ((result.length > 0)) {
                res.status(400).json({ message: "Email is already registered !" });

            }
            else {
                const hashedPassword = await bcrypt.hash(password, saltRounds);
                con.query("INSERT INTO users (email,password) VALUES (? , ?);", [email, hashedPassword], (err, result) => {
                    if (err) throw err;
                    res.json({"message":"Registered Successfully !!!"})
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
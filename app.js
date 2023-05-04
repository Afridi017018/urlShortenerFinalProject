// const mysql = require("mysql")
const express = require("express")
require("dotenv").config()
const shortid = require("shortid")
const {v4: uuidv4} = require("uuid")
const session = require("express-session")
const {passport} = require('./passportAuth')
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




app.get("/:shortId",(req, res) => {
    const { shortId } = req.params;
     con.query("SELECT redirectUrl From url WHERE url = ?",[shortId],(err,result)=>
     {
        if(result.length>0){
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

    con.query("INSERT INTO url(id,url,redirectUrl) VALUES (?,?,?)",[uuid,shortId,url],(err,result)=>{
        if(err) throw err;

        res.json({"shortUrl": shortId, "RedirectUrl": url})
    })

    
})




const isAuthenticated= (req,res,next)=>{
    // console.log(req.user)
    if(req.user){
      return next();
    }
    return res.send("Login please")
  }


app.get("/", isAuthenticated, (req, res) => {
    // console.log(req.user)
    res.send("This is home")

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
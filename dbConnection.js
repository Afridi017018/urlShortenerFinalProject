const mysql = require("mysql");
const regSchema = require("./regSchema");
const urlSchema = require("./urlSchema");

const databaseConfig = {
    host: "localhost",
    user: "root",
    password: "",
    database: "testing"
}

const con = mysql.createConnection(databaseConfig);

con.connect((err) => {
    if (err) {
        console.log("not connected")
    }
    else {
        console.log("DB connected successfully!!!")
    }
})


con.query(regSchema);
con.query(urlSchema);

module.exports = con;
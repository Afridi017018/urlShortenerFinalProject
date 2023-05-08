const mysql = require("mysql");
const usersSchema = require("../dbSchema/usersSchema/usersSchema");
const urlsSchema = require("../dbSchema/urlsSchema/urlsSchema");

const databaseConfig = process.env.dbConfig;

const con = mysql.createConnection(databaseConfig);

con.connect((err) => {
    if (err) {
        console.log("not connected")
    }
    else {
        console.log("DB connected successfully!!!")
    }
})


con.query(usersSchema);
con.query(urlsSchema);

module.exports = con;
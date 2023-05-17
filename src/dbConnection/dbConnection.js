const mysql = require("mysql2");
const rolesTable = require("../dbSchema/rolesTable/rolesTable")
const usersTable = require("../dbSchema/usersTable/usersTable");
const urlsTable = require("../dbSchema/urlsTable/urlsTable");

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


const defaultDataAdmin = `
INSERT INTO roles (role)
SELECT 'admin' AS role
WHERE NOT EXISTS (SELECT * FROM roles WHERE role = 'admin');

`

const defaultDataCustomer = `
INSERT INTO roles (role)
SELECT 'customer' AS role
WHERE NOT EXISTS (SELECT * FROM roles WHERE role = 'customer');

`

con.query(rolesTable)
con.query(usersTable);
con.query(urlsTable);

con.query(defaultDataAdmin);
con.query(defaultDataCustomer);

module.exports = con;
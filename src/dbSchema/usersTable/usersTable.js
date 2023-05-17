const usersTable = `CREATE TABLE IF NOT EXISTS users(
    id BIGINT  NOT NULL UNIQUE AUTO_INCREMENT,
    email VARCHAR(1000) NOT NULL UNIQUE,
    password VARCHAR(1000) NOT NULL,
    role varchar(50) NOT NULL CHECK (role IN ('admin','user') ),
    PRIMARY KEY(id)
   )
`



module.exports = usersTable;
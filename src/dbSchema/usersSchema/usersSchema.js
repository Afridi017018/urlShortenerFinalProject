const usersSchema = `CREATE TABLE IF NOT EXISTS users(
    id BIGINT  NOT NULL UNIQUE AUTO_INCREMENT,
    email VARCHAR(1000) NOT NULL UNIQUE,
    password VARCHAR(1000) NOT NULL,
    PRIMARY KEY(id)
   )
`



module.exports = usersSchema;
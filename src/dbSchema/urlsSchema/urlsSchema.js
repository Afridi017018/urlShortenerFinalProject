const urlsSchema = `CREATE TABLE IF NOT EXISTS urls(
    id BIGINT  NOT NULL UNIQUE AUTO_INCREMENT,
    short_url varchar(1000) NOT NULL UNIQUE,
    redirect_url varchar(1000) NOT NULL,
    user_id BIGINT,
    
    PRIMARY KEY(id),
    FOREIGN KEY(user_id) REFERENCES users(id)
 
    )
`


module.exports = urlsSchema;
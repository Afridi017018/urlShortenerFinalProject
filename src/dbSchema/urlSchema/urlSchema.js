const urlSchema = `
CREATE TABLE IF NOT EXISTS url ( 
id varchar(255) UNIQUE NOT NULL, 
Email varchar(255), url varchar(255) NOT NULL UNIQUE, 
redirectUrl varchar(255) Not Null, PRIMARY KEY(id) 
);
`;


module.exports = urlSchema;
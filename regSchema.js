const regSchema = `
CREATE TABLE IF NOT EXISTS 
registration ( 
Email VARCHAR(255) UNIQUE NOT NULL,
Password INT NOT NULL,
PRIMARY KEY(Email)
);
`;


module.exports = regSchema;
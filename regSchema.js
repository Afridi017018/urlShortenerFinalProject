const regSchema = `
CREATE TABLE IF NOT EXISTS 
registration (
id INT PRIMARY KEY AUTO_INCREMENT, 
Email VARCHAR(255), Password INT
);
`;


module.exports = regSchema;
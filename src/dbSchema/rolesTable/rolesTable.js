const rolesTable = `
CREATE TABLE IF NOT EXISTS roles(
    id BIGINT NOT NULL UNIQUE AUTO_INCREMENT,
    role VARCHAR(8) CHECK (role IN ('admin','customer')),
    PRIMARY KEY(id)
    
    )
`


module.exports = rolesTable;
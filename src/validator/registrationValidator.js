const registrationValidator = {
    "type": "object",
    "properties": {
      "email": {
        "type": "string"
      },
      "password": {
        "type": "string",
        "minLength": 6
      },
      "confirm_password": {
        "type": "string",
        "minLength": 6
      },
      "admin_code": {
        "type": "string"
      }
    },
    "required": ["email", "password", "confirm_password"],
    "additionalProperties": false
  }
  

  module.exports = registrationValidator;
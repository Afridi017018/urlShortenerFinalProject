const loginValidator = {
    "type": "object",
    "properties": {
      "email": {
        "type": "string"
      },
      "password": {
        "type": "string",
        "minLength": 6
      }
    },
    "required": [
      "email",
      "password"
    ],
    "additionalProperties": false
  }
  

  module.exports = loginValidator;
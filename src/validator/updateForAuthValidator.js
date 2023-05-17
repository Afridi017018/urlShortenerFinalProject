const updateForAuthValidator = {
    "type": "object",
    "properties": {
      "old_url": {
        "type": "string",
        "minLength": 1,
        "maxLength": 50
      },
      "new_url": {
        "type": "string",
        "minLength": 1,
        "maxLength": 50
      }
    },
    "required": ["old_url", "new_url"],
    "additionalProperties": false
  }
  

  module.exports = updateForAuthValidator;
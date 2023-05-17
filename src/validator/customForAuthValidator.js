const customForAuthValidator = {
  "type": "object",
  "properties": {
    "short_url": {
      "type": "string",
      "minLength": 1,
      "maxLength": 50
    },
    "redirect_url": {
      "type": "string",
      "minLength": 1,
      "maxLength": 999
    },
    "expire_days": {
      "type": "integer",
      "minimum": 1,
      "maximum": 365
    }
  },
  "required": ["short_url", "redirect_url"],
  "additionalProperties": false
}

  

  module.exports =  customForAuthValidator;
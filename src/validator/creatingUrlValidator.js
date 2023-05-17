const creatingUrlValidator = {
    "type": "object",
    "properties": {
      "redirect_url": {
        "type": "string"
      },
      "expire_days": {
        "type": "integer",
        "minimum": 1,
        "maximum": 365
      }
    },
    "required": ["redirect_url"],
    "additionalProperties": false
  }
  
  


  module.exports = creatingUrlValidator;
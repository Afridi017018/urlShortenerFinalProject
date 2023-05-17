const shortUrlParamsValidator = {
   "type": "object",
    "properties": {
    "short_url": { 
    "type": "string",
    "minLength": 1,
    "maxLength": 50 },
    },
    "required": ["short_url"], 
    "additionalProperties": false 
  };


  module.exports = shortUrlParamsValidator;
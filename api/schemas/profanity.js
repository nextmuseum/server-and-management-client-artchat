module.exports = {
    POST: {
        "title": "POST Profanity",
        "description": "Update profanity filter",
        "type": "object",
        "properties": {
            "wordlist": {"type":"array"},
        },
        "required": ["wordlist"],
        "additionalProperties": false
    }
}
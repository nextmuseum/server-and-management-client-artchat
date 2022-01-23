module.exports = {
    PUT: {
        "title": "PUT User",
        "description": "Update user object scheme",
        "type": "object",
        "properties": {
            "username": {"type":"string"},
            "title": {"type":"array"},
        },
        "additionalProperties": false
    }
}
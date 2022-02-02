module.exports = {
    PUT: {
        "title": "PUT User",
        "description": "Create user metadata object scheme",
        "type": "object",
        "properties": {
            "username": {"type":"string"},
            "activity": {"type":"array"},
            "userId": {"type":"string"}
        },
        "required": ["userId"],
        "additionalProperties": false
    },
    PATCH: {
        "title": "PATCH User",
        "description": "Update user metadata object scheme",
        "type": "object",
        "properties": {
            "username": {"type":"string"},
            "activity": {"type":"array"},
            "userId": {"type":"string"}
        },
        "additionalProperties": false
    }
}
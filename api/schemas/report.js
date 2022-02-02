module.exports = {
    PUT: {
        "title": "PUT Report",
        "description": "Create report object scheme",
        "type": "object",
        "properties": {
            "messageId": {"type":"string"},
            "commentId": {"type":"string"},
            "userId": {"type":"array"}
        },
        "required": ["userId"],
        "oneOf": ["messageId", "commentId"],
        "additionalProperties": false
    }
}
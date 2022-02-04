module.exports = {
    PUT: {
        "title": "PUT Report",
        "description": "Create report object scheme",
        "type": "object",
        "properties": {
            "messageId": {"type":"string"},
            "commentId": {"type":"string"},
            "userId": {"type":"string"}
        },
        "required": ["userId"],
        "oneOf": [
            { required: [ "messageId"] },
            { required: [ "commentId"] }
        ],
        "additionalProperties": false
    }
}
module.exports = {
    PUT: {
        "title": "PUT Message",
        "description": "Create Message Body Schema",
        "type": "object",
        "properties": {
            "text": {"type": "string"},
            "artworkId": {"type": "string"},
            "commentId": {"type": "string"},
            "userId": {"type": "string"}
        },
        "required" : ["text", "artworkId", "commentId", "userId"],
        "additionalProperties": false
    },
    POST: {
        "title": "POST Message",
        "description": "POST Message Body Schema",
        "type": "object",
        "properties": {
            "text": {"type": "string"},
            "commentId": {"type": "string"},
            "artworkId": {"type": "string"},
            "userId": {"type": "string"},
            "reaction": { "type": "string" },
        },
        "anyOf": [
            {
                "required": [
                    "text"
                ]
            },
            {
                "required": [
                    "reaction"
                ]
            }
        ],
        "additionalProperties": false
    }
}
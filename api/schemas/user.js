module.exports = {
    PUT: {
        "title": "PUT User",
        "description": "Create user metadata object scheme",
        "type": "object",
        "properties": {
            "userName": {"type":"string"},
            "activity": {"type":"array"},
            "userId": {"type":"string"}
        },
        "required": ["userId"],
        "additionalProperties": false
    },
    POST: {
        "title": "POST User",
        "description": "Update user metadata object scheme",
        "type": "object",
        "properties": {
            "userName": {"type":"string"},
            "activity": {"type":"array"},
            "userId": {"type":"string"}
        },
        "additionalProperties": false
    },
    POST_USERACTIVITY: {
        "title": "POST User activity",
        "description": "Update user activity object scheme",
        "type": "object",
        "properties": {
            "exhibitionId": {"type":"string"},
            "artwork": {"type":"string"},
            "userId": {"type":"string"}
        },
        "additionalProperties": false
    }
}
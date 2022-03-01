module.exports = {
    PUT: {
        "title": "PUT Report",
        "description": "Create report object scheme",
        "type": "object",
        "properties": {
            "messageId": {"type":"string"},
            "commentId": {"type":"string"},
            "userId": {"type":"string"},
            "userName": {"type":"string"}
        },
        "required": ["userId"],
        "oneOf": [
            { required: [ "messageId"] },
            { required: [ "commentId"] }
        ],
        "additionalProperties": false
    },
    DELETE_BY_KEY: {
        "title": "DELETE Reports",
        "description": "Delete many reports by foreign object key",
        "type": "object",
        "properties": {
            "objectId": {"type":"string"}
        },
        "required": ["objectId"],
        "additionalProperties": false
    }
}
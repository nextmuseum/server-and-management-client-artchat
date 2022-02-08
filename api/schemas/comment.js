module.exports = {
    PUT: {
        "title": "PUT Comment",
        "description": "Create Comment Body Schema",
        "type": "object",
        "properties": {
            "text": {"type": "string"},
            "userId": {"type": "string"},
            "artworkId": {"type": "string"},
            "position":
            {
                "title": "Vector3 Position",
                "description": "Unity Vector3 Position converted to JSON",
                "type": "object",
                "properties": {
                    "x": {"type": "number"},
                    "y": {"type": "number"},
                    "z": {"type": "number"}
                },
                "required" : ["x","y","z"]
            },
            "rotation":
            {
                "title": "Vector3 Rotation",
                "description": "Unity Vector3 Rotation converted to JSON",
                "type": "object",
                "properties": {
                    "x": {"type": "number"},
                    "y": {"type": "number"},
                    "z": {"type": "number"}
                },
                "required" : ["x","y","z"]
            }
        },
        "required" : ["text","position","rotation","artworkId","userId"],
        "additionalProperties": false
    },
    POST: {
        "title": "POST Comment",
        "description": "Update Comment Body Schema",
        "type": "object",
        "properties": {
            "text": {"type": "string"},
            "artworkId": {"type": "string"},
            "userId": {"type": "string"},
            "position":
            {
                "title": "Vector3 Position",
                "description": "Unity Vector3 Position converted to JSON",
                "type": "object",
                "properties": {
                    "x": {"type": "number"},
                    "y": {"type": "number"},
                    "z": {"type": "number"}
                },
                "required" : ["x","y","z"]
            },
            "rotation":
            {
                "title": "Vector3 Rotation",
                "description": "Unity Vector3 Rotation converted to JSON",
                "type": "object",
                "properties": {
                    "x": {"type": "number"},
                    "y": {"type": "number"},
                    "z": {"type": "number"}
                },
                "required" : ["x","y","z"]
            }
        },
        "required" : ["text"],
        "additionalProperties": false
    }
}
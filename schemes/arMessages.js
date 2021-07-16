module.exports = {
    POST: {
        "title": "POST Message",
        "description": "POST Message Body Scheme",
        "type": "object",
        "properties": {
            "text": {"type": "string"},
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
        "required" : ["text","position","rotation"],
        "additionalProperties": false
    },
    PUT: {
        "title": "PUT Message",
        "description": "PUT Message Body Scheme",
        "type": "object",
        "properties": {
            "text": {"type": "string"},
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
        "required" : [],
        "additionalProperties": false
    }
}
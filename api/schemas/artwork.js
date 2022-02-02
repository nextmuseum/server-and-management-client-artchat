module.exports = {
    PUT: {
        "title": "PUT Artwork",
        "description": "Create Artwork Body Schema",
        "type": "object",
        "properties": {
            "artist": {"type":"string"},
            "title": {"type":"string"},
            "description": {"type":"string"},
            "year": {"type":"string"},
            "imageSrc": {"type":"string"},
            "mapId": {"type": "number"}
        },
        "required" : ["title", "artist", "description", "mapId"],
        "additionalProperties": false
    }
}
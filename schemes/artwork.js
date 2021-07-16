module.exports = {
    POST: {
        "title": "POST Artwork",
        "description": "POST Artwork Body Scheme",
        "type": "object",
        "properties": {
            "artist": {"type":"string"},
            "title": {"type":"string"},
            "description": {"type":"string"},
            "year": {"type":"string"},
            "imageSrc": {"type":"string"},
            "mapID": {"type": "number"}
        },
        "required" : ["title", "artist", "description", "mapID"],
        "additionalProperties": false
    }
}
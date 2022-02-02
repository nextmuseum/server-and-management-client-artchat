module.exports = {
    PUT: {
        "title": "PUT Exhibition",
        "description": "PUT Exhibition Body Schema",
        "type": "object",
        "properties": {
            "title": {"type":"string"},
            "description": {"type":"string"},
            "imageSrc": {"type":"string"},
            "beginning": {"type":"string"},
            "end": {"type":"string"},
            "museum": {"type":"string"},
            "city": {"type":"string"}
        },
        "required" : ["title","description"],
        "additionalProperties": false
    }
}
module.exports = {
    POST: {
        "title": "POST Exhibition",
        "description": "POST Exhibition Body Scheme",
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
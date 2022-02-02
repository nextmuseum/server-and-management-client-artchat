var express = require('express')
var router = express.Router()

const { requireJson, checkSchema, checkId, validate } = require(__basedir + '/helper/custom-middleware')

const artworkSchema = require(__basedir + '/schemas/artwork')

const _modelTemplate = require(__basedir + '/models/_modelTemplate')
const artworkStore = new _modelTemplate("artworks")

router.put('/', [requireJson(), checkSchema(artworkSchema.PUT)], (req,res) => {
    let newArtwork = req.body

    artworkStore.create(newArtwork, (response) => {
        if(!response) {
            res.status(500).end()
            return
        } else {
            res.status(201).set("Content-Type", 'application/json').json(response).end()
        }
    })
})

router.get('/', (req,res) => {
    artworkStore.getBySettings({},{},0,10, (response) => {
        if(!response){
            res.status(404).end()
            return
        }else{
            res.status(200).set("Content-Type", 'application/json').json(response).end()
        }
    })
})

router.get('/:objectId', [checkId(), validate()], (req,res) => {
    artworkStore.getById(req.params.objectId, (response) => {
        if(!response){
            res.status(404).end()
            return
        }else{
            res.status(200).set("Content-Type", 'application/json').json(response).end()
        }
    })
})

//  Sub Route Comment
const comment = require('./comment')
router.use('/:objectId/comments', [checkId(), validate()], (req, res, next) => {
    req.body.artworkId = req.params.objectId
    next()
}, comment)

module.exports = router
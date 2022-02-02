var express = require('express')
var router = express.Router()

const { requireJson, checkSchema, checkId, validate } = require(__basedir + '/helper/custom-middleware')

var exhibitionSchema = require(__basedir + '/schemas/exhibition')

var _modelTemplate = require(__basedir + '/models/_modelTemplate')
var exhibitionStore = new _modelTemplate("exhibitions")


router.put('/', [requireJson(), checkSchema(exhibitionSchema.PUT)], (req,res) => {
    
    exhibitionStore.create(req.body, (response) => {
        if(!response) {
            res.status(500).end()
            return
        } else {
            res.status(201).set("Content-Type", 'application/json').json(response).end()
        }
    })
})

router.get('/', (req,res) => {
    exhibitionStore.getBySettings({},{},0,10, (response) => {
        if(!response){
            res.status(404).end()
            return
        }else{
            res.status(200).set("Content-Type", 'application/json').json(response).end()
        }
    })
})

router.get('/:objectId', [checkId(), validate()], (req,res) => {
    exhibitionStore.getById(req.params.objectId, (response) => {
        if(!response){
            res.status(404).end()
            return
        }else{
            res.status(200).set("Content-Type", 'application/json').json(response).end()
        }
    })
})

//  Sub Route Comment
const artwork = require('./artwork')
router.use('/:objectId/artworks', [checkId(), validate()], (req, res, next) => {
    req.body.exhibitionId = req.params.objectId
    next()
}, artwork)

module.exports = router
var express = require('express')
var router = express.Router()

const { requireJson, checkSchema, checkId, validate, parseIdQueryParam } = require(__basedir + '/helper/custom-middleware')
const guard = require('express-jwt-permissions')()

var exhibitionSchema = require(__basedir + '/schemas/exhibition')

var _modelTemplate = require(__basedir + '/models/_modelTemplate')
var exhibitionStore = new _modelTemplate("exhibitions")

/*
*   Routing
*/

router.put('/',
    [ guard.check("create:exhibitions"),
    requireJson(),
    checkSchema(exhibitionSchema.PUT) ],
    (req,res) => {
    
    exhibitionStore.create(req.body, (response, err) => {
        if(err) {
            return res.status(500).json(err).end()
        } else {
            res.status(201).set("Content-Type", 'application/json').json(response).end()
        }
    })
})

router.get('/', parseIdQueryParam(), (req,res) => {

    let query = req.idQuery || {}

    exhibitionStore.getBySettings(query,{},0,10, (response, err) => {
        if (err)
            return res.status(500).json({'error': err })
        if(!response)
            return res.status(404).end()

        res.status(200).set("Content-Type", 'application/json').json(response)
    })
})

router.get('/:objectId', [checkId(), validate()], (req,res) => {

    exhibitionStore.getById(req.params.objectId, (response, err) => {
        if (err)
            return res.status(500).json({'error': err })
        if(!response)
            return res.status(404).end()
         
        res.status(200).set("Content-Type", 'application/json').json(response)
    })
})

router.delete('/:objectId',
    [checkId(),
    validate(),
    guard.check("delete:exhibitions") ],
    async (req,res) => {

    exhibitionStore.deleteById(req.params.objectId, (response, err) => {
        if (err)
            return res.status(500).json({'error': err })
        if(!response)
            return res.status(404).end()
        
        res.status(204).end()
    })
})

/*
*   Sub routes
*/

const artwork = require('./artwork')
router.use('/:objectId/artworks', [checkId(), validate()], (req, res, next) => {
    req.body.exhibitionId = req.params.objectId
    next()
}, artwork)

module.exports = router
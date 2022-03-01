const express = require('express')
const router = express.Router()

const { requireJson, checkSchema, checkId, validate, parseIdQueryParam } = require(__basedir + '/helper/custom-middleware')
const guard = require('express-jwt-permissions')()

const artworkSchema = require(__basedir + '/schemas/artwork')

const _modelTemplate = require(__basedir + '/models/_modelTemplate')
const artworkStore = new _modelTemplate("artworks")

/*
*   Routing
*/

router.put('/',
    [requireJson(),
    guard.check("create:artworks"),
    checkSchema(artworkSchema.PUT)],
    
    (req,res) => {
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

router.get('/', parseIdQueryParam(), (req,res) => {

    let sort = typeof req.query.sort === 'undefined' ? {} : { _id: req.query.sort }
    let skip = typeof req.query.skip === 'undefined' ? 0 : parseInt(req.query.skip)
    let limit = typeof req.query.limit === 'undefined' ? 10 : parseInt(req.query.limit)
    let count = typeof req.query.count === 'undefined' ? null : req.query.count

    if(count){
        artworkStore.getCountAll( {}, (response, err) => {
            if(!response)
                res.status(500).end()

            else res.status(200).set("Content-Type", 'application/json').json(response)
        })
        return
    }
    
    let query = req.idQuery || {}

    artworkStore.getBySettings(query, sort, skip, limit, (response) => {
        if(!response){
            return res.status(200).json([])
        }else{
            res.status(200).set("Content-Type", 'application/json').json(response)
        }
    })
})

router.get('/:objectId',
    [checkId(), validate()],
    (req,res) => {
    artworkStore.getById(req.params.objectId, (response) => {
        if(!response){
            res.status(404).end()
            return
        }else{
            res.status(200).set("Content-Type", 'application/json').json(response).end()
        }
    })
})

router.delete('/:objectId',
    [checkId(),
    validate(),
    guard.check("delete:artworks") ],
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

const comment = require('./comment')
router.use('/:objectId/comments', [checkId(), validate()], (req, res, next) => {
    req.body.artworkId = req.params.objectId
    next()
}, comment)

module.exports = router
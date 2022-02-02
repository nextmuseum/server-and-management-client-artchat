var express = require('express')
var router = express.Router()

const { requireJson, checkSchema, checkId, validate, checkParameters, authenticateToken } = require(__basedir + '/helper/custom-middleware')

var messageSchema = require(__basedir + '/schemas/message')

var _modelTemplate = require(__basedir + '/models/_modelTemplate')
var messageStore = new _modelTemplate("messages")

router.get('/', [checkParameters(), validate()], (req,res) => {
    //  Prepare Parameters for MongoDB Request
    // let sort = typeof req.query.sort === 'undefined' ? {} : { date: req.query.sort }
    let sort = typeof req.query.sort === 'undefined' ? {} : { _id: req.query.sort }
    let skip = typeof req.query.skip === 'undefined' ? 0 : req.query.skip
    let limit = typeof req.query.limit === 'undefined' ? 10 : req.query.limit
    let count = typeof req.query.count === 'undefined' ? null : req.query.count
    // let settings = typeof req.artworkId === 'undefined' || req.artworkId.length === 0 ? {} : {"artworkId": { "$in": [req.artworkId] }}
    let settings = typeof req.commentId === 'undefined' || req.commentId.length === 0 ? {} : {"commentId": { "$in": [req.commentId] }}

    //  Request Comment Count
    if(count){
        messageStore.getCountAll( settings, (response) => { 
            if(!response){
                res.status(500).end()
                return
            }
            else res.status(200).set("Content-Type", 'application/json').json(response).end()
        })
        return
    }

    //  Get Comment with Settings
    messageStore.getBySettings(settings, sort, skip, limit, (response) => {
        if(!response){
            res.status(500).end()
            return
        }
    
        else res.status(200).set("Content-Type", 'application/json').json(response).end()
    })
})


router.get('/:objectId', [checkId(), validate()],(req,res) => {
    messageStore.getById(req.params.objectId, (response) => {
        if(!response){
            res.status(404).end()
            return
        }else{
            res.status(200).set("Content-Type", 'application/json').json(response).end()
        }
    })
})


router.delete('/:objectId', [checkId(), validate()], async (req,res) => {
    await IsAuthor(req.params.objectId, req.user.sub).catch(() => {res.status(401).end()})

    messageStore.deleteById(req.params.objectId, (response) => {
        if(!response){
            res.status(404).end()
            return
        }else{
            res.status(204).end()
        }
    })
})


router.put('/', [requireJson(), checkSchema(messageSchema.PUT)], (req,res) => {
    
    let newArMessage = req.body
    newArMessage.artworkId = req.artworkId
    newArMessage.userId = req.userId
    newArMessage.commentId = req.commentId

   
    messageStore.create(newArMessage, (response) => {
        if(!response) {
            res.status(500).end()
            return
        } else {
            res.status(201).set("Content-Type", 'application/json').json(response).end()
        }
    })
})


router.put('/:objectId', [checkId(), validate(), checkSchema(messageSchema.PUT)], async (req,res) => {
    await IsAuthor(req.params.objectId, req.user.sub).catch(() => {res.status(401).end()})
    
    messageStore.updateById(req.params.objectId, req.body, (response) => {
        if(!response){
            res.status(404).end()
            return
        }else{
            res.status(204).end()
        }
    })
})



function IsAuthor(messageId, userId){
    return new Promise((resolve, reject) => {
        messageStore.getById(messageId, (response) => {
            if(!response) reject(new Error("Comment not found"))
            else{
                if(response.userId == userId) resolve()
                else reject(new Error("Is not the author"))
            }
        })
    })
}

const report = require('./report')
router.use('/:objectId/reports', [checkId(), validate()], (req, res, next) => {
    req.body.messageId = req.params.objectId
    next()
}, report)

module.exports = router
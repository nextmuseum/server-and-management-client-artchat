var express = require('express')
var router = express.Router()

const { requireJson, checkSchema, checkId, validate, checkParameters, authenticateToken } = require(__basedir + '/helper/custom-middleware')
const { isAuthenticated } = require(__basedir + '/helper/custom-auth-middleware')

const commentSchema = require(__basedir + '/schemas/comment')

const _modelTemplate = require(__basedir + '/models/_modelTemplate')
const commentStore = new _modelTemplate("comments")

router.put('/', [requireJson(), checkSchema(commentSchema.PUT)], (req,res) => {
    //  Prepare Body
    let newComment = req.body

    //  Create Comment
    commentStore.create(newComment, (response) => {
        if(!response) {
            res.status(500).end()
            return
        } else {
            res.status(201).set("Content-Type", 'application/json').json(response).end()
        }
    })
})

router.get('/', [checkParameters(), validate()], (req,res) => {
    //  Prepare Parameters for MongoDB Request
    // let sort = typeof req.query.sort === 'undefined' ? {} : { date: req.query.sort }
    let sort = typeof req.query.sort === 'undefined' ? {} : { _id: req.query.sort }
    let skip = typeof req.query.skip === 'undefined' ? 0 : req.query.skip
    let limit = typeof req.query.limit === 'undefined' ? 10 : req.query.limit
    let count = typeof req.query.count === 'undefined' ? null : req.query.count
    let settings = typeof req.artworkId === 'undefined' || req.artworkId.length === 0 ? {} : {"artworkId": { "$in": [req.artworkId] }}

    //  Request Comment Count
    if(count){
        commentStore.getCountAll( settings, (response) => {
            if(!response){
                res.status(500).end()
                return
            }
            else res.status(200).set("Content-Type", 'application/json').json(response).end()
        })
        return
    }

    //  Get Comment with Settings
    commentStore.getBySettings(settings, sort, skip, limit, (response) => {
        if(!response){
            res.status(500).end()
            return
        }
        
        if(response.length === 0) res.status(404).end()
        else res.status(200).set("Content-Type", 'application/json').json(response).end()
    })
})


router.get('/:objectId', [checkId(), validate()],(req,res) => {
    commentStore.getById(req.params.objectId, (response) => {
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

    commentStore.deleteById(req.params.objectId, (response) => {
        if(!response){
            res.status(404).end()
            return
        }else{
            res.status(204).end()
        }
    })
})


router.put('/:objectId', [checkId(), validate(), checkSchema(commentSchema.PUT)], async (req,res) => {
    await IsAuthor(req.params.objectId, req.user.sub).catch(() => {res.status(401).end()})
    
    commentStore.updateById(req.params.objectId, req.body, (response) => {
        if(!response){
            res.status(404).end()
            return
        }else{
            res.status(204).end()
        }
    })
})

function IsAuthor(commentId, userId){
    return new Promise((resolve, reject) => {
        commentStore.getById(commentId, (response) => {
            if(!response) reject(new Error("Comment not found"))
            else{
                if(response.userId == userId) resolve()
                else reject(new Error("Is not the author"))
            }
        })
    })
}

//  Sub Route Comment
const message = require('./message')
router.use('/:objectId/messages', [checkId(), validate()], (req, res, next) => {
    req.body.commentId = req.params.objectId
    next()
}, message)

const report = require('./report')
router.use('/:objectId/reports', [checkId(), validate()], (req, res, next) => {
    req.body.commentId = req.params.objectId
    next()
}, report)

module.exports = router
var express = require('express')
var router = express.Router()

const { requireJson, checkSchema, checkId, validate, checkParameters } = require(__basedir + '/helper/custom-middleware')
const { injectUserTokenIntoBody, validateInjectAuthUser } = require(__basedir + '/helper/custom-auth-middleware')

const commentSchema = require(__basedir + '/schemas/comment')

const _modelTemplate = require(__basedir + '/models/_modelTemplate')
const commentStore = new _modelTemplate("comments")

const { getReports } = require("./report")

router.put('/', [requireJson(), injectUserTokenIntoBody(), checkSchema(commentSchema.PUT)], (req,res) => {
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


router.get('/:objectId', [checkId(), validate()], async (req,res) => {

    let objectId = req.params.objectId;

    let response
    
    try {
        response = await new Promise((resolve, reject) => {
            commentStore.getById(objectId, (response, err) => {
                if (response)
                    resolve(response)
                if (response == null)
                    resolve(null)
        
                reject(err)
            })
        })
    } catch (err) {
        return res.status(500).json(JSON.stringify(err)).end()
    }

    if(response == null){
        return res.status(404).end()
    }else{
        let enrichedResponse = await injectReports(response);
        res.status(200).set("Content-Type", 'application/json').json(enrichedResponse).end()
    }
})


router.delete('/:objectId', [checkId(), validate()], async (req,res) => {
    
    try {
        await IsAuthor(req.params.objectId, req.body.userId)
    } catch (err) {
        return res.status(401).json(err.toString()).end()
    }

    commentStore.deleteById(req.params.objectId, (response) => {
        if(!response){
            res.status(404).end()
            return
        }else{
            res.status(204).end()
        }
    })
})

router.patch('/:objectId', [checkId(), validate(), injectUserTokenIntoBody(), checkSchema(commentSchema.PATCH)], async (req,res) => {

    try {
        await IsAuthor(req.params.objectId, req.body.userId)
    } catch (err) {
        return res.status(401).json(err.toString()).end()
    }

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

async function injectReports(response) {
    let reports = await getReports(response._id.toString())
    let enrichedResponse = Object.assign(response, { "reports": [...reports] })

    return enrichedResponse
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
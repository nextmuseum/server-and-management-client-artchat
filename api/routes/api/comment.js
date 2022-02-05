var express = require('express')
var router = express.Router()

const { requireJson, checkSchema, checkId, validate, checkParameters } = require(__basedir + '/helper/custom-middleware')
const { injectUserTokenIntoBody, validateInjectAuthUser } = require(__basedir + '/helper/custom-auth-middleware')
const { matchAuthor } = require(__basedir + '/helper/util')

const commentSchema = require(__basedir + '/schemas/comment')

const _modelTemplate = require(__basedir + '/models/_modelTemplate')
const commentStore = new _modelTemplate("comments")

const { getReports } = require("./report")
const { getUserName } = require("./user")

router.put('/', [requireJson(), injectUserTokenIntoBody(), checkSchema(commentSchema.PUT)], async (req,res) => {
    
    req.body.userName = await getUserName(req.body.userId)

    let newComment = req.body

    commentStore.create(newComment, (response, err) => {
        if(err) {
            return res.status(500).end()
        } else {
            res.status(201).set("Content-Type", 'application/json').json(response).end()
        }
    })
})

router.get('/', [checkParameters(), validate()], async (req,res) => {
    //  Prepare Parameters for MongoDB Request
    // let sort = typeof req.query.sort === 'undefined' ? {} : { date: req.query.sort }
    let sort = typeof req.query.sort === 'undefined' ? {} : { _id: req.query.sort }
    let skip = typeof req.query.skip === 'undefined' ? 0 : req.query.skip
    let limit = typeof req.query.limit === 'undefined' ? 10 : req.query.limit
    let count = typeof req.query.count === 'undefined' ? null : req.query.count
    let settings = typeof req.body.artworkId === 'undefined' || req.body.artworkId.length === 0 ? {} : {"artworkId": { "$in": [req.body.artworkId] }}

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
    let comments

    try {
        comments = await new Promise((resolve, reject) => {
            comments = commentStore.getBySettings(settings, sort, skip, limit, (response, err) => {
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

    if(comments.length == 0) return res.status(404).end()

    // collect message ids 
    let messageIds = comments.reduce((p, c) => {
        p.push(c._id.toString())
        return p
    }, [])

    // query reports
    let reports = await getReports(messageIds)

    // merge messages and reports
    
    let mergedReports = comments.reduce((i, c) => {
        let comment = c
        comment.reports = reports.filter((rep) => {
            return comment._id == rep.commentId
        })
        i.push(c)
        return i
    }, [])

    
    res.status(200).set("Content-Type", 'application/json').json(mergedReports).end()
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
        let isAuthor = await matchAuthor(req.params.objectId, req.body.userId, commentStore)
        if (isAuthor === false) return res.status(401).end()
    } catch (err) {
        return res.status(500).json(err).end()
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

router.post('/:objectId', [checkId(), validate(), injectUserTokenIntoBody(), checkSchema(commentSchema.POST)], async (req,res) => {

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
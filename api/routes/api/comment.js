const express = require('express')
const router = express.Router()

const { requireJson, checkSchema, checkId, validate, checkParameters, parseIdQueryParam } = require(__basedir + '/helper/custom-middleware')
const { presetSessionUserIdIntoBody } = require(__basedir + '/helper/custom-auth-middleware')
const guard = require('express-jwt-permissions')({ requestProperty: 'auth' })

const commentSchema = require(__basedir + '/schemas/comment')

const _modelTemplate = require(__basedir + '/models/_modelTemplate')
const commentStore = new _modelTemplate("comments")

const { getReports, injectReports } = require("./report")
const { getUserName } = require("./user")
const { toggleInsertReaction, transformReactions } = require('./components/reactions')

/*
*   Middleware
*/

const verifyAuthorWithRequest = async (req) => {
    let commentId = req.params.objectId,
        userId = req.body.userId

    return await new Promise((resolve, reject ) => {
        commentStore.getById(commentId, (response, err) => {
            if (err) reject (err)
            if (response && response.userId == userId)
                resolve(true)

            resolve(false)
        })
    }).catch((err) => {
        console.log(err)
    })
};

/*
*   Routing
*/

router.put('/',
    [requireJson(),
    presetSessionUserIdIntoBody(),
    checkSchema(commentSchema.PUT)],
    
    async (req,res) => {
    
    req.body.userName = await getUserName(req.body.userId)

    let newComment = req.body

    commentStore.create(newComment, (response, err) => {
        if(err) {
            return res.status(500).end()
        } else {
            res.status(201).set("Content-Type", 'application/json').json(response)
        }
    })
})

router.get('/', [checkParameters(), validate(), parseIdQueryParam()], async (req,res) => {
    //  Prepare Parameters for MongoDB Request
    // let sort = typeof req.query.sort === 'undefined' ? {} : { date: req.query.sort }
    let sort = typeof req.query.sort === 'undefined' ? {} : { _id: req.query.sort }
    let skip = typeof req.query.skip === 'undefined' ? 0 : parseInt(req.query.skip)
    let limit = typeof req.query.limit === 'undefined' ? 10 : parseInt(req.query.limit)
    let count = typeof req.query.count === 'undefined' ? null : req.query.count
    let settings = typeof req.body.artworkId === 'undefined' || req.body.artworkId.length === 0 ? {} : {"artworkId": { "$in": [req.body.artworkId] }}

    // parse ids query list from middleware
    if (req.idQuery) {
        settings = Object.assign(settings, req.idQuery)
    }

    //  Request Comment Count
    if(count){
        commentStore.getCountAll( settings, (response) => {
            if(!response){
                res.status(500).end()
                return
            }
            else res.status(200).set("Content-Type", 'application/json').json(response)
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
        return res.status(500).json(JSON.stringify(err))
    }

    // return if no messages
    if(comments && comments.length == 0) return res.status(200).json([])

    // process reactions
    comments = comments.map(comment => transformReactions(comment, req.body.userId))

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


    if(req.query.reported) {
        mergedReports = mergedReports.filter((el) => el.reports.length)
    }
    
    res.status(200).set("Content-Type", 'application/json').json(mergedReports).end()
})


router.get('/:objectId', [checkId(), validate(), presetSessionUserIdIntoBody()], async (req,res) => {

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
        return res.status(500).json(JSON.stringify(err))
    }

    if(response == null){
        return res.status(404).end()
    } else {
        let enrichedResponse = await injectReports(response);
        enrichedResponse = transformReactions(enrichedResponse, req.body.userId)
        res.status(200).set("Content-Type", 'application/json').json(enrichedResponse)
    }
})


router.delete('/:objectId',
    [checkId(),
    presetSessionUserIdIntoBody(),
    guard.check("delete:comments").unless({ custom: verifyAuthorWithRequest }),
    validate()],
    async (req,res) => {

    commentStore.deleteById(req.params.objectId, (response, err) => {
        if(!response){
            res.status(404).end()
            return
        }else{
            res.status(204).end()
        }
    })
})

router.post('/:objectId',
    [checkId(),
    validate(),
    presetSessionUserIdIntoBody(),
    guard.check("update:comments").unless({ custom: verifyAuthorWithRequest }),
    checkSchema(commentSchema.POST)],
    async (req,res) => {
        const {reaction, ...additionalData} = req.body

        if (reaction) {
            toggleInsertReaction(
                commentStore,
                req.params.objectId,
                req.body.userId,
                reaction
            )
            .then(() => {
                if (!additionalData) {
                    res.status(204).end()
                }
            })
            .catch(() => res.status(500).json({'error': 'failed to set reaction'}))
        }

        commentStore.updateById(req.params.objectId, additionalData, (response, err) => {
            if(!response){
                res.status(404).end()
                return
            }else{
                res.status(204).end()
            }
        })
    }
)


/*
*   Functions
*/




/*
*   Sub routes
*/

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
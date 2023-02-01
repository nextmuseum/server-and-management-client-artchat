const express = require('express')
const router = express.Router()

const { requireJson, checkSchema, checkId, validate, checkParameters, parseIdQueryParam } = require(__basedir + '/helper/custom-middleware')
const { presetSessionUserIdIntoBody } = require(__basedir + '/helper/custom-auth-middleware')
const guard = require('express-jwt-permissions')({ requestProperty: 'auth' })

const messageSchema = require(__basedir + '/schemas/message')

const _modelTemplate = require(__basedir + '/models/_modelTemplate')
const messageStore = new _modelTemplate("messages")

const { getReports, injectReports } = require("./report")
const { getUserName } = require("./user")
const { toggleInsertReaction, transformReactions } = require('./components/reactions')


/*
*   Middleware
*/

const verifyAuthorWithRequest = async (req) => {
    let messageId = req.params.objectId,
        userId = req.body.userId

    return await new Promise((resolve, reject) => {
        messageStore.getById(messageId, (response, err) => {
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

router.get('/',
    [checkParameters(),
    validate(),
    parseIdQueryParam()],
    
    async (req,res) => {
    //  Prepare Parameters for MongoDB Request
    // let sort = typeof req.query.sort === 'undefined' ? {} : { date: req.query.sort }
    let sort = typeof req.query.sort === 'undefined' ? {} : { _id: req.query.sort }
    let skip = typeof req.query.skip === 'undefined' ? 0 : parseInt(req.query.skip)
    let limit = typeof req.query.limit === 'undefined' ? 10 : parseInt(req.query.limit)
    let count = typeof req.query.count === 'undefined' ? null : req.query.count
    let settings = typeof req.body.commentId === 'undefined' || req.body.commentId.length === 0 ? {} : {"commentId": { "$in": [req.body.commentId] }}

    // parse ids query list from middleware
    if (req.idQuery) {
        settings = Object.assign(settings, req.idQuery)
    }

    //  Request Message Count
    if(count){
        messageStore.getCountAll( settings, (response, err) => {
            if(!response){
                res.status(500).end()
                return
            }
            else res.status(200).set("Content-Type", 'application/json').json(response)
        })
        return
    }

    //  Get Messages with Settings
    let messages

    try {
        messages = await new Promise((resolve, reject) => {
            messages = messageStore.getBySettings(settings, sort, skip, limit, (response, err) => {
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
    if(messages && messages.length == 0) return res.status(200).json([])

    // process reactions
    messages = messages.map(message => transformReactions(message, req.body.userId))


    // collect message ids 
    let messageIds = messages.reduce((p, c) => {
        p.push(c._id.toString())
        return p
    }, [])

    // query reports
    let reports = await getReports(messageIds)

    // merge messages and reports
 
    let mergedReports = messages.reduce((i, c) => {
        let message = c
        message.reports = reports.filter((rep) => {
            return message._id == rep.messageId
        })
        i.push(c)
        return i
    }, [])

    if(req.query.reported) {
        mergedReports = mergedReports.filter((el) => el.reports.length)
    }
    
    res.status(200).set("Content-Type", 'application/json').json(mergedReports)
})


router.get('/:objectId', [checkId(), validate(), presetSessionUserIdIntoBody()], async (req,res) => {
    let objectId = req.params.objectId;

    let response
    try {
        response = await new Promise((resolve, reject) => {
            messageStore.getById(objectId, (response, err) => {
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
    
    if(!response){
        return res.status(404).end()
    }else{
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

    messageStore.deleteById(req.params.objectId, (response, err) => {
        if (err)
            return res.status(500).json({'error': err })
        if(!response)
            return res.status(404).end()
            
        res.status(204).end() 
    })
})


router.put('/',
    [requireJson(),
    presetSessionUserIdIntoBody(),
    checkSchema(messageSchema.PUT)],
    
    async (req,res) => {
    
    req.body.userName = await getUserName(req.body.userId)

    let newMessage = req.body
   
    messageStore.create(newMessage, (response) => {
        if(!response) 
            return res.status(500).end()

        res.status(201).set("Content-Type", 'application/json').json(response)
    })
})


router.post('/:objectId',
    [checkId(),
    validate(),
    presetSessionUserIdIntoBody(),
    guard.check("update:comments").unless({ custom: verifyAuthorWithRequest }),
    checkSchema(messageSchema.POST)],
    async (req, res) => {
        const { reaction, userId, ...additionalData } = req.body
        const { objectId } = req.params
        
        if (reaction) {
            toggleInsertReaction(
                messageStore,
                objectId,
                userId,
                reaction
            )
            .then(() => {
                if (!additionalData) {
                    res.status(204).end()
                }
            })
            .catch(() => res.status(500).json({'error': 'failed to set reaction'}))
        }

        messageStore.updateById(objectId, additionalData, (response, err) => {
            if(err)
                return res.status(500).json({'error': err}).send()
            if(!response)
                return res.status(404).end()

            res.status(204).end()
        })
    }
)

/*
*   Functions
*/



/*
*   Sub routes
*/

const report = require('./report')
router.use('/:objectId/reports', [checkId(), validate()], (req, res, next) => {
    req.body.messageId = req.params.objectId
    next()
}, report)

module.exports = router
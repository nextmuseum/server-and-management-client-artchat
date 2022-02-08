var express = require('express')
var router = express.Router()

const { requireJson, checkSchema, checkId, validate, checkParameters } = require(__basedir + '/helper/custom-middleware')
const { injectUserTokenIntoBody, validateInjectAuthUser } = require(__basedir + '/helper/custom-auth-middleware')
const { matchAuthor } = require(__basedir + '/helper/util')

var messageSchema = require(__basedir + '/schemas/message')

var _modelTemplate = require(__basedir + '/models/_modelTemplate')
var messageStore = new _modelTemplate("messages")

const { getReports } = require("./report")
const { getUserName } = require("./user")

router.get('/', [checkParameters(), validate()], async (req,res) => {
    //  Prepare Parameters for MongoDB Request
    // let sort = typeof req.query.sort === 'undefined' ? {} : { date: req.query.sort }
    let sort = typeof req.query.sort === 'undefined' ? {} : { _id: req.query.sort }
    let skip = typeof req.query.skip === 'undefined' ? 0 : req.query.skip
    let limit = typeof req.query.limit === 'undefined' ? 10 : req.query.limit
    let count = typeof req.query.count === 'undefined' ? null : req.query.count
    let settings = typeof req.body.commentId === 'undefined' || req.body.commentId.length === 0 ? {} : {"commentId": { "$in": [req.body.commentId] }}

    //  Request Message Count
    if(count){
        messageStore.getCountAll( settings, (response, err) => {
            if(!response){
                res.status(500).end()
                return
            }
            else res.status(200).set("Content-Type", 'application/json').json(response).end()
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
        return res.status(500).json(JSON.stringify(err)).end()
    }

    if(messages && messages.length == 0) return res.status(404).end()

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

    
    res.status(200).set("Content-Type", 'application/json').json(mergedReports).end()
})


router.get('/:objectId', [checkId(), validate()], async (req,res) => {
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
        return res.status(500).json(JSON.stringify(err)).end()
    }
    
    if(!response){
        return res.status(404).end()
    }else{
        let enrichedResponse = await injectReports(response);
        res.status(200).set("Content-Type", 'application/json').json(enrichedResponse).end()
    }
})


router.delete('/:objectId', [checkId(), injectUserTokenIntoBody(),  validate()], async (req,res) => {
    
    try {
        let isAuthor = await matchAuthor(req.params.objectId, req.body.userId, messageStore)
        if (isAuthor === false) return res.status(401).end()
    } catch (err) {
        return res.status(500).json(err).end()
    }


    messageStore.deleteById(req.params.objectId, (response) => {
        if(!response){
            res.status(404).end()
            return
        }else{
            res.status(204).end()
        }
    })
})


router.put('/', [requireJson(), injectUserTokenIntoBody(), checkSchema(messageSchema.PUT)], async (req,res) => {
    
    req.body.userName = await getUserName(req.body.userId)

    let newMessage = req.body
   
    messageStore.create(newMessage, (response) => {
        if(!response) {
            res.status(500).end()
            return
        } else {
            res.status(201).set("Content-Type", 'application/json').json(response).end()
        }
    })
})


router.post('/:objectId', [checkId(), validate(),  checkSchema(messageSchema.POST)], async (req,res) => {
    await IsAuthor(req.params.objectId, req.body.userId).catch(() => {res.status(401).end()})
    
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

async function injectReports(response) {
    let reports = await getReports(response._id.toString())
    let enrichedResponse = Object.assign(response, { "reports":  [...reports] })

    return enrichedResponse
}

const report = require('./report')
router.use('/:objectId/reports', [checkId(), validate()], (req, res, next) => {
    req.body.messageId = req.params.objectId
    next()
}, report)

module.exports = router
const express = require('express')
const router = express.Router()

const { requireJson, checkSchema, checkId, validate } = require(__basedir + '/helper/custom-middleware')
const { presetSessionUserIdIntoBody } = require(__basedir + '/helper/custom-auth-middleware')
const guard = require('express-jwt-permissions')({ requestProperty: 'auth' })

const reportSchema = require(__basedir + '/schemas/report')

const _modelTemplate = require(__basedir + '/models/_modelTemplate')
const reportStore = new _modelTemplate("reports")

const { getUserName } = require("./user")

/*
*   Middleware
*/


const verifyAuthorWithRequest = async (req) => {
    let reportId = req.params.objectId,
        userId = req.body.userId

    return await new Promise((resolve, reject ) => {
        reportStore.getById(reportId, (response, err) => {
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
    checkSchema(reportSchema.PUT)],
    async (req, res) => {

    req.body.userName = await getUserName(req.body.userId)

    let newReport = req.body
    
    try {
        let reportedObjectId = req.body.commentId || req.body.messageId
        let reportUserId = req.body.userId
        let isUniqueReport = await reportedObjectIsUniqueForUser( reportedObjectId, reportUserId )
        
        if (!isUniqueReport)
            return res.status(409).json({"error": `comment/message ${reportedObjectId} report already exists for user ${reportUserId}`}).end()
        
    } catch (err) {
        return res.status(500).json(err.toString()).end()
    }
    
    reportStore.create(newReport, (response) => {
        if(!response) {
            res.status(500).end()
            return
        } else {
            res.status(201).set("Content-Type", 'application/json').json(response).end()
        }
    })
})

router.get('/', async (req, res) => {

    let reportedObjectId = req.query.reportedObjectId || null;

    const response = await getReports(reportedObjectId);

    if(!response){
        return res.status(200).json([])
    }else{
        res.status(200).set("Content-Type", 'application/json').json(response).end()
    }
    
})

router.get('/:objectId',
    [checkId(),
    validate()],
    
    (req, res) => {
    reportStore.getById(req.params.objectId, (response, err) => {
        if(err)
            return res.status(500).json({'error': err})
        if(!response)
            return res.status(404).end()
            
        res.status(200).set("Content-Type", 'application/json').json(response)
    })
})


router.delete('/:objectId',
    [checkId(),
    presetSessionUserIdIntoBody(),
    guard.check("delete:reports").unless({ custom: verifyAuthorWithRequest }),
    validate()],
    
    async (req,res) => {

    reportStore.deleteById(req.params.objectId, (response, err) => {
        if(err)
            return res.status(500).json({'error': err})
        if(!response)
            return res.status(404).end()

        res.status(204).end()
    })
})

// delete by passing message/comment id
router.delete('/',
    [checkId(),
    guard.check("delete:reports"),
    checkSchema(reportSchema.DELETE_BY_KEY),
    validate()],
    
    async (req,res) => {

    let relatedMessageId = req.body.objectId
    
    console.log(relatedMessageId)
    if(!relatedMessageId) return res.status(400).json({"error": "No object id provided"})

    let deleteQuery = {
        $or : [
            { "commentId": { "$in": [relatedMessageId] } },
            { "messageId": { "$in": [relatedMessageId] } }
        ]
    }

    reportStore.deleteBySettings(deleteQuery, (response, err) => {
        if(err)
            return res.status(500).json({'error': err})
        if(!response)
            return res.status(404).end()

        res.status(204).end()
    })
})


module.exports = router

/*
*   Functions
*/

function reportedObjectIsUniqueForUser(reportedObjectId, userId){

    return new Promise((resolve, reject) => {
        let settings = {
            $and : [
                {
                    $or : [
                        { "commentId": { "$in": [reportedObjectId] } },
                        { "messageId": { "$in": [reportedObjectId] } }
                    ]
                },
                { "userId": { "$in": [userId] } 
            }]
            
        };

        reportStore.getBySettings(settings,{},0,10, (response, err) => {
            console.log(response)
            if(response && response.length == 0 ) 
                resolve(true)
            else if (response && response.length > 0 )
                resolve(false)

            reject(err)
            
        })
    })
}


const getReports = function(reportedObjectIds) {
    
    let query = {}

    // ad-hoc polymorphism -.-'
    if (reportedObjectIds !== null) {
        let reportedObjectIdQuery = (typeof reportedObjectIds === 'string') ? [reportedObjectIds] : reportedObjectIds;

        query = {
            $or : [
                { "commentId": { "$in": reportedObjectIdQuery } },
                { "messageId": { "$in": reportedObjectIdQuery } }
            ]
        }
    }
       
    return new Promise((resolve, reject) => {

        reportStore.getBySettings(query,{},0,10, (response, err) => {

            if (response)
                resolve(response)
            reject(err)
        })
    })
}

module.exports.getReports = getReports

const injectReports = async function(response) {
    const reports = await getReports(response._id.toString())
    const enrichedResponse = Object.assign(response, { "reports": [...reports] })

    return enrichedResponse
}

module.exports.injectReports = injectReports
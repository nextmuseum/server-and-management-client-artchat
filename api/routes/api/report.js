var express = require('express')
var router = express.Router()

const { requireJson, checkSchema, checkId, validate } = require(__basedir + '/helper/custom-middleware')
const { injectUserTokenIntoBody, validateInjectAuthUser } = require(__basedir + '/helper/custom-auth-middleware')


var reportSchema = require(__basedir + '/schemas/report')

var _modelTemplate = require(__basedir + '/models/_modelTemplate')
var reportStore = new _modelTemplate("reports")


router.put('/', [requireJson(), injectUserTokenIntoBody(), checkSchema(reportSchema.PUT)], async (req,res) => {
    
    try {
        let reportedObjectId = req.body.commentId || req.body.messageId
        let reportUserId = req.body.userId
        let isUniqueReport = await reportedObjectIsUniqueForUser( reportedObjectId, reportUserId )
        
        if (!isUniqueReport)
            return res.status(409).json({"error": `comment/message ${reportedObjectId} report already exists for user ${reportUserId}`}).end()
        
    } catch (err) {
        return res.status(500).json(err.toString()).end()
    }
    
    reportStore.create(req.body, (response) => {
        if(!response) {
            res.status(500).end()
            return
        } else {
            res.status(201).set("Content-Type", 'application/json').json(response).end()
        }
    })
})

router.get('/', async (req,res) => {

    let reportedObjectId = req.query.reportedObjectId;

    const response = await getReports(reportedObjectId);

    if(!response){
        res.status(404).end()
        return
    }else{
        res.status(200).set("Content-Type", 'application/json').json({"count": response.length, "data": [...response]}).end()
    }
    
})

router.get('/:objectId', [checkId(), validate()], (req,res) => {
    reportStore.getById(req.params.objectId, (response) => {
        if(!response){
            res.status(404).end()
            return
        }else{
            res.status(200).set("Content-Type", 'application/json').json(response).end()
        }
    })
})


router.delete('/:objectId', [checkId(), validate()], async (req,res) => {
    
    try {
        await IsAuthor(req.params.objectId, req.body.userId)
    } catch (err) {
        return res.status(401).json(err.toString()).end()
    }

    reportStore.deleteById(req.params.objectId, (response) => {
        if(!response){
            res.status(404).end()
            return
        }else{
            res.status(204).end()
        }
    })
})


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
            
            if(response && response.length == 0 ) 
                resolve(true)
            else if (response && response.length > 0 )
                resolve(false)

            reject(err)
            
        })
    })
}


function IsAuthor(commentId, userId){
    return new Promise((resolve, reject) => {
        reportStore.getById(commentId, (response) => {
            if(!response) reject(new Error("Comment not found"))
            else{
                if(response.userId == userId) resolve()
                else reject(new Error("Is not the author"))
            }
        })
    })
}

function getReports(reportedObjectIds) {
    
    // ad-hoc polymorphism *.*
    let reportedObjectIdQuery = (typeof reportedObjectIds == 'string') ? [reportedObjectIds] : reportedObjectIds;

    return new Promise((resolve, reject) => {
        let query = {
            $or : [
                { "commentId": { "$in": reportedObjectIdQuery } },
                { "messageId": { "$in": reportedObjectIdQuery } }
            ]
        }

        reportStore.getBySettings(query,{},0,10, (response, err) => {

            if (response)
                resolve(response)
            reject(err)
        })
    })
}


module.exports = router
module.exports.getReports = getReports
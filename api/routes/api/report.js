var express = require('express')
var router = express.Router()

const { requireJson, checkSchema, checkId, validate } = require(__basedir + '/helper/custom-middleware')
const { injectUserTokenIntoBody, validateInjectAuthUser } = require(__basedir + '/helper/custom-auth-middleware')


var reportSchema = require(__basedir + '/schemas/report')

var _modelTemplate = require(__basedir + '/models/_modelTemplate')
var reportStore = new _modelTemplate("reports")


router.put('/', [requireJson(), injectUserTokenIntoBody(), checkSchema(reportSchema.PUT)], async (req,res) => {
    
    let reportedObjectId = req.body.commentId || req.body.messageId;
    try {
        await reportedObjectIsUniqueForUser( reportedObjectId, req.body.userId)
    } catch (err) {
        return res.status(409).json(err.toString()).end()
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

router.get('/', (req,res) => {
    reportStore.getBySettings({},{},0,10, (response) => {
        if(!response){
            res.status(404).end()
            return
        }else{
            res.status(200).set("Content-Type", 'application/json').json(response).end()
        }
    })
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
    await IsAuthor(req.params.objectId, req.user.sub).catch(() => {res.status(401).end()})

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
    console.log(reportedObjectId);
    console.log(userId);

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

        reportStore.getBySettings(settings,{},0,10, (response) => {
            
            if(response.length > 0 )
                reject(new Error(`Object ${reportedObjectId} already exists for user ${userId}`))
            resolve() 
            
        })
    })
}


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


module.exports = router
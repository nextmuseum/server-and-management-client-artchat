require('dotenv').config()
var express = require('express')
var router = express.Router()

const { requireJson, checkSchema, checkId, validate, authenticateToken } = require(__basedir + '/helper/custom-middleware')
const { injectUserTokenIntoBody, validateInjectAuthUser } = require(__basedir + '/helper/custom-auth-middleware')

var _modelTemplate = require(__basedir + '/models/_modelTemplate')
var userSchema = require(__basedir + '/schemas/user')
var userModel = new _modelTemplate("users")


// Pseudo endpoints for easier access

router.get('/me',  (req, res) => {

    let authId = req.user.sub.split('|')[1]
    res.redirect('./' + authId)

})

router.patch('/me/appdata', (req, res) => {    

    let authId = req.user.sub.split('|')[1]
    res.redirect(307, '../' + authId + '/appdata')

})

router.put('/me/appdata', (req, res) => {    

    console.log("me app data triggered")
    let authId = req.user.sub.split('|')[1]
    res.redirect(307, '../' + authId + '/appdata')

})

router.get('/:userId', validateInjectAuthUser(), async (req,res) => { 

    let validAuthUser = req.authUser
    let validAuthUserId = req.authUser.user_id.split('|')[1] // auth0|7a6sd576a5s6d75 get last bit

    await GetUserByUserId(validAuthUserId)
    .then(response => {
        validAuthUser.appdata = response
    })
    .catch(err => {
        //console.log(JSON.stringify(err))
        console.log(`user data for user ${validAuthUserId} not found`)
    })

    res.json(validAuthUser)
	
})

router.put('/:userId/appdata', [validateInjectAuthUser(), injectUserTokenIntoBody(), checkSchema(userSchema.PUT)], async (req,res) => {


    console.log("user id app data triggered")


    let validAuthUserId = req.authUser.user_id.split('|')[1] // auth0|7a6sd576a5s6d75 get last bit
    if (req.params.userId != validAuthUserId) res.status(403).send()

    await GetUserByUserId(validAuthUserId)
    .then(response => {
        return res.status(405).json({"error": `user appdata for user id ${validAuthUserId} already exist`}).end()
    })
    .catch(err => {
        // user does not exist, continue
        
        let user = req.body

        userModel.create(user, (response, err) => {
            if (err)
                res.status(500).json(err)
            if(response == null){
                res.status(200).json({result: 'no records were updated'}).end()
            }else{
                res.status(204).end()
            }
        })

        console.log(JSON.stringify(err))
    })

})

router.patch('/:userId/appdata', [validateInjectAuthUser(), injectUserTokenIntoBody(), checkSchema(userSchema.PATCH)], async (req,res) => {

    let validAuthUserId = req.authUser.user_id.split('|')[1] 
    if (req.params.userId != validAuthUserId) res.status(403).send()

    let objectId = ""
    
    await GetUserByUserId(validAuthUserId)
    .then(response => {
        if (!response) res.status(405).json({"error": `user appdata for user id ${validAuthUserId} does not exist`})
        objectId = response_id
    })
    .catch(err => {
        //console.log(JSON.stringify(err))
        res.status(500).json(err)
    })

    let user = req.body

    userModel.updateById(objectId, user, (response, err) => {
        if (err)
            res.status(500).json(err)
        if(response == null){
            res.status(200).json({result: 'no records were updated'}).end()
        }else{
            res.status(204).end()
        }
    })
    
})


//  ADD Artwork/Exhibition
router.patch('/:objectId/activity', [requireJson(), checkId(), validate(), authenticateToken()], async(req,res) => {
    
    if(req.params.objectId != req.userId) return res.status(401).send()

    const user = await GetUserByObjectId(req.params.objectId).catch(() => {res.status(400).end()})

    const foundEntry = user.activity.find(el => el.exhibitionId == req.body.exhibitionId)

    if(foundEntry == null){
        await AddUniqueEntry(
            req.params.objectId,
            null,
            null,
            {$addToSet: {"activity": { "exhibitionId": req.body.exhibitionId}}}
        ).catch(() => {res.status(500).end()})
    }

    await AddUniqueEntry(
        req.params.objectId,
        "activity",
        {$elemMatch: {"exhibitionId": req.body.exhibitionId}},
        {$addToSet: {"activity.$.artwork": req.body.artwork}}
    ).catch(() => {res.status(500).end()})

    res.status(201).send()
})

//  GET Artwork/Exhibition
router.get('/:objectId/activity', [checkId(), validate()], async(req,res) => {

    const activityList = await GetUserExhibitionsByObjectId(req.params.objectId).catch(() => res.status(401).end() )

    res.json(activityList).send()
})

function AddUniqueEntry(userId, match, matchSettings, settings){
    return new Promise((resolve,reject) => {
        userModel.addToSet(userId, match, matchSettings, settings, (response) =>{
            if(!response){
                reject(new Error("IdK"))
            }else{
                resolve()
            }
        })
    })
}

function upsertUser(user) {
    try { 
        userModel.create(user, (response) => {
            if(!response) {
                res.status(500).end()
                return
            } else {
                res.status(201).set("Content-Type", 'application/json').json(response).end()
            }
        })
    } catch {
        res.status(500).send()
    }
}

function GetUserByName(username){
    return new Promise((resolve, reject) => {
        let settings = {"username": { "$in": [username] }}

        userModel.getBySettings(settings,{},0,10, (response) => {
            if(!response || response.length == 0) reject(new Error("User not found"))
            
            resolve(response[0])
            
        })
    })
}

function GetUserByUserId(authId){
    return new Promise((resolve, reject) => {
        
        let settings = {"userId": { "$in": [authId] }}
        
        userModel.getBySettings(settings,{},0,10, (response) => {

            if(!response || response.length == 0) reject(new Error("User not found"))

            resolve(response[0])
            
        })
    })
}

function GetUserByObjectId(objectId){
    return new Promise((resolve, reject) => {
        userModel.getById(objectId, (response) => {
            if(!response || response.length == 0) reject(new Error("User not found"))
            resolve(response)
        })
    })
}

function GetUserExhibitionsByObjectId(objectId){
    return new Promise((resolve, reject) => {
        userModel.getById(objectId, (response) => {
            if(!response) reject(new Error("User not found"))
            else {
                if (response.activity == null) resolve([])
                else resolve( response.activity )
            }
        })
    })
}


module.exports = router
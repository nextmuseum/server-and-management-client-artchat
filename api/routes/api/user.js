require('dotenv').config()
var express = require('express')
var router = express.Router()

const { requireJson, checkSchema, checkId, checkUserId, validate, authenticateToken } = require(__basedir + '/helper/custom-middleware')
const { injectUserTokenIntoBody, validateInjectAuthUser } = require(__basedir + '/helper/custom-auth-middleware')
const guard = require('express-jwt-permissions')()


var _modelTemplate = require(__basedir + '/models/_modelTemplate')
var userSchema = require(__basedir + '/schemas/user')
var userStore = new _modelTemplate("users")

const verifyUserIsHimself = (req) => {
    return (req.params.userId == req.user.sub.split('|')[1])
};
    

// Pseudo endpoints for easier access

router.get('/me',  (req, res) => {

    let authId = req.user.sub.split('|')[1]
    res.redirect(307, './' + authId)

})

router.post('/me/appdata', (req, res) => {    

    let authId = req.user.sub.split('|')[1]
    res.redirect(307, '../' + authId + '/appdata')

})

router.put('/me/appdata', (req, res) => {    

    console.log("me app data triggered")
    let authId = req.user.sub.split('|')[1]
    res.redirect(307, '../' + authId + '/appdata')

})

router.get('/', guard.check("read:users") , (req,res) => {
    
    userStore.getBySettings({},{},0,10, (response, err) => {
        if (err) return res.status(500).send(err);

        if(!response){
            return res.status(204).end()
        }else{
            res.status(200).set("Content-Type", 'application/json').json(response)
        }
    })
})


router.get('/:userId',
    [guard.check("read:users").unless({ custom: verifyUserIsHimself }),
    validateInjectAuthUser()],
    async (req,res) => { 

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

router.put('/:userId/appdata', 
    [guard.check("read:users").unless({ custom: verifyUserIsHimself}),
    validateInjectAuthUser(),
    injectUserTokenIntoBody(),
    checkSchema(userSchema.PUT)],
    async (req,res) => {

    let validAuthUserId = req.authUser.user_id.split('|')[1] // auth0|7a6sd576a5s6d75 get last bit
    if (req.params.userId != validAuthUserId) return res.status(403).send()

    await GetUserByUserId(validAuthUserId)
    .then(response => {
        if (response != null)
            return res.status(405).json({"error": `user appdata for user id ${validAuthUserId} already exist`}).end()
        
        let user = req.body

        userStore.create(user, (response, err) => {
            if (err)
                res.status(500).json(err)
            if(response == null){
                res.status(200).json({result: 'no records were updated'}).end()
            }else{
                res.status(204).end()
            }
        })

    })
    .catch(err => {
        // user does not exist, continue
        return res.status(500).json(err.toString()).end()

    })

})

router.post('/:userId/appdata',
    [guard.check("read:users").unless({ custom: verifyUserIsHimself}),
    validateInjectAuthUser(),
    injectUserTokenIntoBody(),
    checkSchema(userSchema.POST)],
    async (req,res) => {

    let validAuthUserId = req.authUser.user_id.split('|')[1] 
    if (req.params.userId != validAuthUserId) return res.status(403).send()

    let objectId = ""
    
    await GetUserByUserId(validAuthUserId)
    .then(response => {
        if (!response) res.status(405).json({"error": `user appdata for user id ${validAuthUserId} does not exist`})
        objectId = response._id
    })
    .catch(err => {
        //console.log(JSON.stringify(err))
        res.status(500).json(err)
    })

    let user = req.body

    userStore.updateById(objectId, user, (response, err) => {
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
router.post('/:userId/activity',
    [requireJson(),
    validateInjectAuthUser(),
    injectUserTokenIntoBody(),
    checkUserId(),
    validate()],
    async(req,res) => {
    
    if(req.params.userId != req.body.userId) return res.status(401).send()

    const user = await GetUserByUserId(req.params.userId).catch(() => {return res.status(400).end()})

    const exhibitionEntry = (user.activity) ? user.activity.find(el => el.exhibitionId == req.body.exhibitionId) : null

    if(exhibitionEntry == null){
        await AddUniqueEntry(
            user._id,
            null,
            null,
            {$addToSet: {"activity": { "exhibitionId": req.body.exhibitionId}}}
        ).catch(() => {res.status(500).end()})
    }

    await AddUniqueEntry(
        user._id,
        "activity",
        {$elemMatch: {"exhibitionId": req.body.exhibitionId}},
        {$addToSet: {"activity.$.artwork": req.body.artwork}}
    ).catch(() => {res.status(500).end()})

    res.status(201).send()
})

//  GET Artwork/Exhibition
router.get('/:userId/activity',
    [
        validate()
    ], async(req,res) => {

    const activity = await GetUserExhibitionsByUserId(req.params.userId).catch(() => {return res.status(401).end() })

    res.json(activity).send()
})

function AddUniqueEntry(userId, match, matchSettings, settings){
    return new Promise((resolve,reject) => {
        userStore.addToSet(userId, match, matchSettings, settings, (response) =>{
            if(!response){
                reject(new Error("IdK"))
            }else{
                resolve()
            }
        })
    })
}



function GetUserByUserId(userId){
    return new Promise((resolve, reject) => {
        
        let settings = {"userId": { "$in": [userId] }}
        
        userStore.getBySettings(settings,{},0,10, (response, err) => {

            if(!response || response.length == 0) resolve(null)
            resolve(response[0])
            reject(new Error(err))
            
        })
    })
}


function GetUserExhibitionsByUserId(userId){
    return new Promise((resolve, reject) => {

        let settings = {"userId": { "$in": [userId] }}

        userStore.getBySettings(settings,{},0,10, (response, err) => {

            if(!response || response.length == 0) resolve(null)
            resolve( response[0].activity )
            reject(new Error(err))
        
        })
    })
}

async function getUserName(userId) {
    try {
        let user = await GetUserByUserId(userId)
        return user.userName
    } catch (err) {
        console.log(err)
    }
}


module.exports = router
module.exports.getUserName = getUserName;
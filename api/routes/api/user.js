require('dotenv').config()
var express = require('express')
var router = express.Router()

const { requireJson, checkSchema, validate } = require(__basedir + '/helper/custom-middleware')
const { injectUserIdIntoBody, validateInjectAuthUser } = require(__basedir + '/helper/custom-auth-middleware')
const { getAuthUserByIdSuffix, deleteAuthUserById } = require(__basedir + '/helper/util');
const guard = require('express-jwt-permissions')()


var _modelTemplate = require(__basedir + '/models/_modelTemplate')
var userSchema = require(__basedir + '/schemas/user')
var userStore = new _modelTemplate("users")

/*
*   Middleware
*/

const verifyUserIsHimself = (req) => {
    return (req.params.userId == req.user.sub.split('|')[1])
};
    

/*
*   Routing
*/

// Pseudo endpoints for easier access

router.get('/me/:subroute?',  (req, res) => {

    let authId = req.user.sub.split('|')[1]
    let subRoute = req.params.subroute || null
    if (subRoute)
        return res.redirect(307, '../' + authId + '/' + ( subRoute || ''))
    res.redirect(307, './' + authId)
})

router.post('/me/:subroute', (req, res) => {    

    let authId = req.user.sub.split('|')[1]
    res.redirect(307, '../' + authId + '/' + req.params.subroute)

})

router.put('/me/:subroute', (req, res) => {    

    let authId = req.user.sub.split('|')[1]
    res.redirect(307, '../' + authId + '/' + req.params.subroute)

})

router.get('/', guard.check("read:users") , (req,res) => {

    let sort = typeof req.query.sort === 'undefined' ? {} : { _id: req.query.sort }
    let skip = typeof req.query.skip === 'undefined' ? 0 : req.query.skip
    let limit = typeof req.query.limit === 'undefined' ? 10 : req.query.limit
    let count = typeof req.query.count === 'undefined' ? null : req.query.count

    if(count){
        userStore.getCountAll( {}, (response, err) => {
            if(!response){
                res.status(500).end()
                return
            }
            else res.status(200).set("Content-Type", 'application/json').json(response).end()
        })
        return
    }
    
    userStore.getBySettings({}, sort, skip, limit, (response, err) => {
        if (err) return res.status(500).send(err);

        if(!response){
            return res.status(200).json([])
        }else{
            res.status(200).set("Content-Type", 'application/json').json(response)
        }
    })
})


router.get('/:userId',
    [guard.check("read:users").unless({ custom: verifyUserIsHimself }),
    validateInjectAuthUser()],

    async (req,res) => { 

    let userId = req.params.userId,
        user

    if (userId == req.authUser.user_id.split('|')[1]) 
        user = req.authUser
    else
        try {
            user = await getAuthUserByIdSuffix(userId)
            if (user == null) return res.status(404).json({'error':`auth user with id ${userId} not found`})
        } catch (err) {
            return res.status(500).json({'error': err})
        }
        
    await getUserByUserId(userId)
    .then(response => {
        user.appdata = response
    })
    .catch(err => {
        //console.log(JSON.stringify(err))
        console.log(`user data for user ${userId} not found`)
    })

    res.json(user)
	
})

router.delete('/:userId',
    [guard.check("delete:users").unless({ custom: verifyUserIsHimself }),
    validateInjectAuthUser()],
    async (req, res) => { 
    
    let userId = req.params.userId,
        authUser,
        mongoUser

    // get Auth0 user object
    try {
        authUser = await getAuthUserByIdSuffix(userId)
        if (authUser == null) return res.status(404).json({'error':`auth user with id ${userId} not found`})
    } catch (err) {
        return res.status(500).json({'error': err})
    }

    // get mongo user object

    try {
        mongoUser = await getUserByUserId(userId)
        if (mongoUser == null) console.log(`mongo user with id ${userId} not found for deletion`)
    } catch (err) {
        return res.status(500).json({'error': err})
    }

    // delete 
    try {
        // delete metadata
        if (mongoUser != null) {
            await deleteUserByObjectId(mongoUser._id).catch(err => {
                console.log(err)
            })        
        }

        // delete authUser
        let deletionResult = await deleteAuthUserById(authUser.user_id)

        if (deletionResult == null)
            return res.status(204).end()
    } catch (err) {
        return res.status(500).json({'error': err})
    }

})

router.put('/:userId/appdata', 
    [guard.check("write:users").unless({ custom: verifyUserIsHimself}),
    validateInjectAuthUser(),
    injectUserIdIntoBody(),
    checkSchema(userSchema.PUT)],
    async (req,res) => {

    let validAuthUserId = req.authUser.user_id.split('|')[1] // auth0|7a6sd576a5s6d75 get last bit
    if (req.params.userId != validAuthUserId) return res.status(403).send()

    await getUserByUserId(validAuthUserId)
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
    [guard.check("write:users").unless({ custom: verifyUserIsHimself}),
    validateInjectAuthUser(),
    injectUserIdIntoBody(),
    checkSchema(userSchema.POST)],
    async (req,res) => {

    let validAuthUserId = req.authUser.user_id.split('|')[1] 
    if (req.params.userId != validAuthUserId) return res.status(403).send()

    let objectId = ""
    
    await getUserByUserId(validAuthUserId)
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
    [guard.check("write:users").unless({ custom: verifyUserIsHimself}),
    requireJson(),
    validateInjectAuthUser(),
    injectUserIdIntoBody(),
    checkSchema(userSchema.POST_USERACTIVITY),
    validate()],
    async(req,res) => {
    
    

    const user = await getUserByUserId(req.params.userId).catch(() => {return res.status(400).end()})

    const exhibitionEntry = (user.activity) ? user.activity.find(el => el.exhibitionId == req.body.exhibitionId) : null

    if(exhibitionEntry == null){
        await addUniqueEntry(
            user._id,
            null,
            null,
            {$addToSet: {"activity": { "exhibitionId": req.body.exhibitionId}}}
        ).catch(() => {res.status(500).end()})
    }

    await addUniqueEntry(
        user._id,
        "activity",
        {$elemMatch: {"exhibitionId": req.body.exhibitionId}},
        {$addToSet: {"activity.$.artwork": req.body.artwork}}
    ).catch(() => {res.status(500).end()})

    res.status(201).send()
})

//  GET Artwork/Exhibition
router.get('/:userId/activity',
    [guard.check("read:users").unless({ custom: verifyUserIsHimself}),
    validate()],
    async(req,res) => {

    const activity = await getUserExhibitionsByUserId(req.params.userId).catch(() => {return res.status(401).end() })

    res.json(activity).send()
})


/*
*   Functions
*/

function addUniqueEntry(userId, match, matchSettings, settings){
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



function getUserByUserId(userId){
    return new Promise((resolve, reject) => {
        
        let settings = {"userId": { "$in": [userId] }}
        
        userStore.getBySettings(settings,{},0,10, (response, err) => {

            if(!response || response.length == 0) resolve(null)
            resolve(response[0])
            reject(new Error(err))
            
        })
    })
}

function deleteUserByObjectId(objectId){
    return new Promise((resolve, reject) => {
        
        userStore.deleteById(objectId, (response, err) => {

            if(!response || response.length == 0) resolve(null)
            resolve(response[0])
            reject(new Error(err))
            
        })
    })
}


function getUserExhibitionsByUserId(userId){
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
        let user = await getUserByUserId(userId)
        return user.userName
    } catch (err) {
        console.log(err)
    }
}


module.exports = router
module.exports.getUserName = getUserName;
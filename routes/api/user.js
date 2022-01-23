require('dotenv').config();
var express = require('express');
var router = express.Router();
var bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');

const { requireJson, checkScheme, checkID, validate, authenticateToken } = require('../../helper/custom-middleware');
const { isAuthenticated } = require('../../helper/custom-auth-middleware');
const { requiresAuth } = require('express-openid-connect');
const { a0management } = require('../../helper/Auth0Manager');

var ModelTemplate = require('../../models/ModelTemplate');
var userScheme = require(__basedir + '/schemes/user');
const { resolveSchema } = require('ajv/dist/compile');
var userModel = new ModelTemplate("dev_art_db", "user_col");

router.get('/me', isAuthenticated, (req, res) => {

	a0management.getUser({ id: req.user.sub })
	.then(user => {
        let authID = req.user.sub.split('|')[1];

        let enrichedUserObject = user;

        GetUserByAuthID(authID)
        .then(response => {
            enrichedUserObject.app_data = response || {};
            return res.json(enrichedUserObject);
        })
        .catch(err => {
            res.status(500).json(err);
            console.log(JSON.stringify(err));
        });


	})
	.catch(err => {
        console.log(JSON.stringify(err));
        res.status(403).json({'error': 'user not found'});
    });

});

router.put('/me', [isAuthenticated, checkScheme(userScheme.PUT)], async (req, res) => {    

    let authID = req.user.sub.split('|')[1];

    let mongoId = await GetUserByAuthID(authID)
    .then(response => {
        if(!response){
            return null;
        }else{
            return response._id;
        }
    })
    .catch(err => console.log(JSON.stringify(err)));

    userModel.updateByID(mongoId, req.body, (response) => {
        if(!response){
            res.status(404).end();
            return;
        }else{
            res.status(204).set("Content-Type", 'application/json').end();
        }
    });

})


module.exports = router;


//  GET
/* router.get('/', (req,res) => {
    userModel.getBySettings({},{},0,10, (response) => {
        if(!response){
            res.status(404).end();
            return;
        }else{
            res.status(200).set("Content-Type", 'application/json').json(response).end();
        }
    });
});
 */
//  GET
router.get('/:objectid', [checkID(), validate()], (req,res) => {
    userModel.getByID(req.params.objectid, (response) => {
        if(!response){
            res.status(404).end();
            return;
        }else{
            res.status(200).set("Content-Type", 'application/json').json(response).end();
        }
    });
});



//  ADD Artwork/Exhibition
router.post('/:objectid/activity', [requireJson(), checkID(), validate(), authenticateToken()], async(req,res) => {
    if(req.params.objectid != req.userID){ res.status(401).send(); return; }

    const user = await GetUserWithID(req.params.objectid).catch(() => {res.status(400).end();});

    const foundEntry = user.activity.find(el => el.exhibitionID == req.body.exhibitionID);

    if(foundEntry == null){
        await AddUniqueEntry(
            req.params.objectid,
            null,
            null,
            {$addToSet: {"activity": { "exhibitionID": req.body.exhibitionID}}}
        ).catch(() => {res.status(500).end();});
    }

    await AddUniqueEntry(
        req.params.objectid,
        "activity",
        {$elemMatch: {"exhibitionID": req.body.exhibitionID}},
        {$addToSet: {"activity.$.artwork": req.body.artwork}}
    ).catch(() => {res.status(500).end();});

    res.status(201).send();
});

//  GET Artwork/Exhibition
router.get('/:objectid/activity', [checkID(), validate()], async(req,res) => {
    //if(req.params.objectid != req.userID){ res.status(401).send(); return; }

    const list = await GetUserExhibitions(req.params.objectid).catch(() => {res.status(401).end(); return;})

    res.json(list).send();
});

function AddUniqueEntry(userID, match, matchSettings, settings){
    return new Promise((resolve,reject) => {
        userModel.addToSet(userID, match, matchSettings, settings, (response) =>{
            if(!response){
                reject(new Error("IDK"));
            }else{
                resolve();
            }
        });
    });
}


function upsertUser(user) {
    try { 
        userModel.create(user, (response) => {
            if(!response) {
                res.status(500).end();
                return;
            } else {
                res.status(201).set("Content-Type", 'application/json').json(response).end();
            }
        });
    } catch {
        res.status(500).send();
    }
}

function GetUserByName(username){
    return new Promise((resolve, reject) => {
        let settings = {"username": { "$in": [username] }};

        userModel.getBySettings(settings,{},0,10, (response) => {
            if(!response) reject(new Error("User not found"));
            else {
                if(response.length == 0) reject(new Error("User not found"));
                else resolve(response[0]);
            }
        });
    });
}

function GetUserByAuthID(authID){
    return new Promise((resolve, reject) => {
        
        let settings = {"authID": { "$in": [authID] }};
        console.log(JSON.stringify(settings));

        userModel.getBySettings(settings,{},0,10, (response) => {
            console.log(JSON.stringify(response));
            if(!response) reject(new Error("User not found"));
            else {
                if(response.length == 0) reject(new Error("User not found"));
                else resolve(response[0]);
            }
        });
    });
}

function GetUserWithID(userID){
    return new Promise((resolve, reject) => {
        userModel.getByID(userID, (response) => {
            if(!response) reject(new Error("User not found"));
            else resolve(response);
        });
    });
}

function GetUserExhibitions(userID){
    return new Promise((resolve, reject) => {
        userModel.getByID(userID, (response) => {
            if(!response) reject(new Error("User not found"));
            else {
                if (response.activity == null) resolve([]);
                else resolve( response.activity );
            }
        });
    });
}


module.exports = router;
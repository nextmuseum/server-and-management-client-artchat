require('dotenv').config();
var express = require('express');
var router = express.Router();
var bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');

const { requireJson, checkID, validate, authenticateToken } = require('../../helper/custom-middleware');
const { isAuthenticated } = require('../../helper/custom-auth-middleware');
const { requiresAuth } = require('express-openid-connect');
const { a0management } = require('../../helper/Auth0Manager');


var ModelTemplate = require('../../models/ModelTemplate');
var userModel = new ModelTemplate("art_db", "user_col");

router.get('/', isAuthenticated, (req, res) => {

	a0management.getUser({ id: req.user.sub })
	.then(user => {
		res.json(user);
	})
	.catch(err => console.log(JSON.stringify(err)));

});

router.put('/', requiresAuth(), (req, res) => {

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

//  GET
router.get('/:objectid/name', [checkID(), validate()], (req,res) => {
    userModel.getByID(req.params.objectid, (response) => {
        if(!response){
            res.status(404).end();
            return;
        }else{
            res.status(200).format({ text: function () { res.send(response.username) }});
        }
    });
});

//  POST
router.post('/register', async(req,res) => {
    const user = await GetUser(req.body.username).catch(() => {})

    if (user != null){ res.status(409).end(); return; }

    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        let newUser = { username: req.body.username, password: hashedPassword, activity: [] };

        userModel.create(newUser, (response) => {
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
});

//  LOGIN
router.post('/login', async(req,res) => {
    const user = await GetUser(req.body.username).catch(() => {res.status(401).end(); return;})

    if (user == null){ res.status(400).send(); return; }

    try {
        if(await bcrypt.compare(req.body.password, user.password)){
            const accessToken = jwt.sign(user._id.toString(), process.env.ACCESS_TOKEN_SECRET);
            res.json({accessToken: accessToken, userID: user._id.toString()}).send();
        }else{
            res.status(403).send();
        }
    } catch {
        res.status(500).send();
    }
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

function GetUser(username){
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
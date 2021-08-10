var express = require('express');
var router = express.Router();

//  Custom Middleware
const { requireJson, checkScheme, checkID, validate, checkParameters, authenticateToken } = require('../helper/custom-middleware');

//  JSON Comment Scheme for Validation
var messageScheme = require('../schemes/arMessages');
//  Comment Model for MongoDB Access
//  var commentModel = require('../models/comment');
var ModelTemplate = require('../models/ModelTemplate');
var arMessageModel = new ModelTemplate("art_db", "arMessages_col");

//  POST
router.post('/', [requireJson(), authenticateToken(), checkScheme(messageScheme.POST)], (req,res) => {
    //  Prepare Body
    let newArMessage = req.body;
    newArMessage.artworkID = req.artworkID;
    newArMessage.userID = req.userID;
    newArMessage.commentID = req.commentID;

    //  Create Comment
    arMessageModel.create(newArMessage, (response) => {
        if(!response) {
            res.status(500).end();
            return;
        } else {
            res.status(201).set("Content-Type", 'application/json').json(response).end();
        }
    });
});


//  GET w/ Settings
router.get('/', [checkParameters(), validate()], (req,res) => {
    //  Prepare Parameters for MongoDB Request
    // let sort = typeof req.query.sort === 'undefined' ? {} : { date: req.query.sort };
    let sort = typeof req.query.sort === 'undefined' ? {} : { _id: req.query.sort };
    let skip = typeof req.query.skip === 'undefined' ? 0 : req.query.skip;
    let limit = typeof req.query.limit === 'undefined' ? 10 : req.query.limit;
    let count = typeof req.query.count === 'undefined' ? null : req.query.count;
    // let settings = typeof req.artworkID === 'undefined' || req.artworkID.length === 0 ? {} : {"artworkID": { "$in": [req.artworkID] }};
    let settings = typeof req.commentID === 'undefined' || req.commentID.length === 0 ? {} : {"commentID": { "$in": [req.commentID] }};

    //  Request Comment Count
    if(count){
        arMessageModel.getCountAll( settings, (response) => {
            if(!response){
                res.status(500).end();
                return;
            }
            else res.status(200).set("Content-Type", 'application/json').json(response).end();
        });
        return;
    }

    //  Get Comment with Settings
    arMessageModel.getBySettings(settings, sort, skip, limit, (response) => {
        if(!response){
            res.status(500).end();
            return;
        }
        
        if(response.length === 0) res.status(404).end();
        else res.status(200).set("Content-Type", 'application/json').json(response).end();res.status(500).end();
    });
});

//  GET w/ ID
router.get('/:objectid', [checkID(), validate()],(req,res) => {
    arMessageModel.getByID(req.params.objectid, (response) => {
        if(!response){
            res.status(404).end();
            return;
        }else{
            res.status(200).set("Content-Type", 'application/json').json(response).end();
        }
    });
});

// DELETE w/ ID
router.delete('/:objectid', [checkID(), validate(), authenticateToken()], async (req,res) => {
    await IsAuthor(req.params.objectid, req.userID).catch(() => {res.status(401).end();})

    arMessageModel.deleteByID(req.params.objectid, (response) => {
        if(!response){
            res.status(404).end();
            return;
        }else{
            res.status(204).end();
        }
    });
});

// PUT w/ ID
router.put('/:objectid', [checkID(), validate(), authenticateToken(), checkScheme(messageScheme.PUT)], async (req,res) => {
    await IsAuthor(req.params.objectid, req.userID).catch(() => {res.status(401).end();})
    
    arMessageModel.updateByID(req.params.objectid, req.body, (response) => {
        if(!response){
            res.status(404).end();
            return;
        }else{
            res.status(204).end();
        }
    });
});

function IsAuthor(messageID, userID){
    return new Promise((resolve, reject) => {
        arMessageModel.getByID(messageID, (response) => {
            if(!response) reject(new Error("Comment not found"));
            else{
                if(response.userID == userID) resolve();
                else reject(new Error("Is not the author"));
            }
        });
    });
}

module.exports = router;
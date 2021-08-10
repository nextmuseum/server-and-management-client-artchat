var express = require('express');
var router = express.Router();

//  Custom Middleware
const { requireJson, checkScheme, checkID, validate, checkParameters, authenticateToken } = require('../helper/custom-middleware');

//  JSON Comment Scheme for Validation
var commentScheme = require('../schemes/comment');
//  Comment Model for MongoDB Access
//  var commentModel = require('../models/comment');
var ModelTemplate = require('../models/ModelTemplate');
var commentModel = new ModelTemplate("art_db", "comment_col");

//  POST
router.post('/', [requireJson(), authenticateToken(), checkScheme(commentScheme.POST)], (req,res) => {
    //  Prepare Body
    let newComment = req.body;
    newComment.artworkID = req.artworkID;
    newComment.userID = req.userID;

    //  Create Comment
    commentModel.create(newComment, (response) => {
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
    let settings = typeof req.artworkID === 'undefined' || req.artworkID.length === 0 ? {} : {"artworkID": { "$in": [req.artworkID] }};

    //  Request Comment Count
    if(count){
        commentModel.getCountAll( settings, (response) => {
            if(!response){
                res.status(500).end();
                return;
            }
            else res.status(200).set("Content-Type", 'application/json').json(response).end();
        });
        return;
    }

    //  Get Comment with Settings
    commentModel.getBySettings(settings, sort, skip, limit, (response) => {
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
    commentModel.getByID(req.params.objectid, (response) => {
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

    commentModel.deleteByID(req.params.objectid, (response) => {
        if(!response){
            res.status(404).end();
            return;
        }else{
            res.status(204).end();
        }
    });
});

// PUT w/ ID
router.put('/:objectid', [checkID(), validate(), authenticateToken(), checkScheme(commentScheme.PUT)], async (req,res) => {
    await IsAuthor(req.params.objectid, req.userID).catch(() => {res.status(401).end();})
    
    commentModel.updateByID(req.params.objectid, req.body, (response) => {
        if(!response){
            res.status(404).end();
            return;
        }else{
            res.status(204).end();
        }
    });
});

function IsAuthor(commentID, userID){
    return new Promise((resolve, reject) => {
        commentModel.getByID(commentID, (response) => {
            if(!response) reject(new Error("Comment not found"));
            else{
                if(response.userID == userID) resolve();
                else reject(new Error("Is not the author"));
            }
        });
    });
}

//  Sub Route Comment
const arMessage = require('./arMessages');
router.use('/:objectid/arMessages', [checkID(), validate()], (req, res, next) => {
    // req.artworkID = req.params.objectid;
    req.commentID = req.params.objectid;
    next();
}, arMessage);

module.exports = router;
var express = require('express');
var router = express.Router();

//  Custom Middleware
const { requireJson, checkScheme, checkID, validate } = require(__basedir + '/helper/custom-middleware');

//  JSON Comment Scheme for Validation
var artworkScheme = require(__basedir + '/schemes/artwork');
//  Comment Model for MongoDB Access
//  var artworkModel = require('../models/artwork');
var ModelTemplate = require(__basedir + '/models/ModelTemplate');
var artworkModel = new ModelTemplate("art_db", "artwork_col");

//  POST
router.post('/', [requireJson(), checkScheme(artworkScheme.POST)], (req,res) => {
    //  Prepare Body
    let newArtwork = req.body;
    newArtwork.exhibitionID = req.exhibitionID;

    //  Create Artwork
    artworkModel.create(req.body, (response) => {
        if(!response) {
            res.status(500).end();
            return;
        } else {
            res.status(201).set("Content-Type", 'application/json').json(response).end();
        }
    });
});

//  GET
router.get('/', (req,res) => {
    artworkModel.getBySettings({},{},0,10, (response) => {
        if(!response){
            res.status(404).end();
            return;
        }else{
            res.status(200).set("Content-Type", 'application/json').json(response).end();
        }
    });
});

//  GET w/ ID
router.get('/:objectid', [checkID(), validate()], (req,res) => {
    artworkModel.getByID(req.params.objectid, (response) => {
        if(!response){
            res.status(404).end();
            return;
        }else{
            res.status(200).set("Content-Type", 'application/json').json(response).end();
        }
    });
});

//  Sub Route Comment
const comment = require('./comment');
router.use('/:objectid/comment', [checkID(), validate()], (req, res, next) => {
    req.artworkID = req.params.objectid;
    next();
}, comment);

module.exports = router;
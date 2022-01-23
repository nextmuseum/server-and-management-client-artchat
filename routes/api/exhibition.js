var express = require('express');
var router = express.Router();

//  Custom Middleware
const { requireJson, checkScheme, checkID, validate } = require(__basedir + '/helper/custom-middleware');

//  JSON Exhibition Scheme for Validation
var exhibitionScheme = require(__basedir + '/schemes/exhibition');
//  Exhibition Model for MongoDB Access
var ModelTemplate = require(__basedir + '/models/ModelTemplate');
var exhibitionModel = new ModelTemplate("art_db", "exhibition_col");

//  POST
router.post('/', [requireJson(), checkScheme(exhibitionScheme.POST)], (req,res) => {
    //  Create Comment
    exhibitionModel.create(req.body, (response) => {
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
    exhibitionModel.getBySettings({},{},0,10, (response) => {
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
    exhibitionModel.getByID(req.params.objectid, (response) => {
        if(!response){
            res.status(404).end();
            return;
        }else{
            res.status(200).set("Content-Type", 'application/json').json(response).end();
        }
    });
});

//  Sub Route Comment
const artwork = require('./artwork');
router.use('/:objectid/artwork', [checkID(), validate()], (req, res, next) => {
    req.exhibitionID = req.params.objectid;
    next();
}, artwork);

module.exports = router;
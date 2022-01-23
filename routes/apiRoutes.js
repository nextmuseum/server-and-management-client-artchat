var express = require('express');
var router = express.Router();

const exhibition = require('./api/exhibition');
router.use('/exhibition', exhibition);
const artwork = require('./api/artwork');
router.use('/artwork', artwork);
const comment = require('./api/comment');
router.use('/comment', comment);
const user = require('./api/user');
router.use('/user', user);

module.exports = router; 
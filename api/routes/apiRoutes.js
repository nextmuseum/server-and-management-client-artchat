const express = require('express')
const router = express.Router()

const { isAuthenticated } = require(__basedir + '/helper/custom-auth-middleware')

router.use(isAuthenticated)

const exhibition = require('./api/exhibition')
router.use('/exhibitions', exhibition)
const artwork = require('./api/artwork')
router.use('/artworks', artwork)
const comment = require('./api/comment')
router.use('/comments', comment)
const message = require('./api/message')
router.use('/messages', message)
const report = require('./api/report')
router.use('/reports', report)
const user = require('./api/user')
router.use('/users', user)

module.exports = router 
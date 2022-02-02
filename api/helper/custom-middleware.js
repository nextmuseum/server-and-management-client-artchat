var ObjectID = require('mongodb').ObjectID
var Ajv = require('ajv').default
var ajv = new Ajv({allErrors: true})
var jwt = require('jsonwebtoken')
const { body, check, validationResult } = require('express-validator')

exports.requireJson = () => {
    return (req, res, next) => {
        if(!req.is('application/json')) {
            res.status(415).end()
        }else next()
    }
}
exports.checkSchema = (scheme) => {
    return (req, res, next) => {
        if(!ajv.validate(scheme, req.body)) {
            res.status(400).set("Content-Type", 'application/json').json({'errors': ajv.errors}).end()
        }else next()
    }
}
exports.checkId = () => {
    return [
        check('objectId').custom((value, {req, location, path}) => {
            if(!ObjectID.isValid(value)) throw new Error('Invalid ObjectID!')
            else req[location][path] = ObjectID(value)
            return true
        })
    ]
}

exports.checkUserId = () => {
    return [
        body('userId').custom((value, {req, location, path}) => {
            if(!ObjectID.isValid(value)) throw new Error('Invalid ObjectID!')
            else req[location][path] = ObjectID(value)
            return true
        })
    ]
}

exports.checkParameters = () => {
    return [
        check('limit').optional().isInt().toInt(),
        check('skip').optional().isInt().toInt(),
        check('sort').optional().isInt().isIn([1,-1]).toInt(),
        check('count').optional().isBoolean().toBoolean()
    ]
}
exports.validate = () => {
    return (req, res, next) => {
        const errors = validationResult(req)
        if(!errors.isEmpty()){
            res.status(400).set("Content-Type", 'application/json').json({'errors':errors.array()}).end()
        }else next()
    }
}
exports.authenticateToken = () => {
    return (req, res, next) => {
        const authHeader = req.headers['authorization']
        const token = authHeader && authHeader.split(' ')[1]

        if(token == null) res.status(401).send()

        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, userID) => {
            if(err) res.status(403).send()
            else{
                req.userID = userID
                next()
            }
        })
    }
}
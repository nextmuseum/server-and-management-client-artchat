var express = require('express')
var router = express.Router()

const { requireJson, checkSchema, checkId, validate } = require(__basedir + '/helper/custom-middleware')

var reportSchema = require(__basedir + '/schemas/report')

var _modelTemplate = require(__basedir + '/models/_modelTemplate')
var reportStore = new _modelTemplate("reports")


router.put('/', [requireJson(), checkSchema(reportSchema.PUT)], (req,res) => {
    
    reportStore.create(req.body, (response) => {
        if(!response) {
            res.status(500).end()
            return
        } else {
            res.status(201).set("Content-Type", 'application/json').json(response).end()
        }
    })
})

router.get('/', (req,res) => {
    reportStore.getBySettings({},{},0,10, (response) => {
        if(!response){
            res.status(404).end()
            return
        }else{
            res.status(200).set("Content-Type", 'application/json').json(response).end()
        }
    })
})

router.get('/:objectId', [checkId(), validate()], (req,res) => {
    reportStore.getById(req.params.objectId, (response) => {
        if(!response){
            res.status(404).end()
            return
        }else{
            res.status(200).set("Content-Type", 'application/json').json(response).end()
        }
    })
})


router.delete('/:objectId', [checkId(), validate()], async (req,res) => {
    await IsAuthor(req.params.objectId, req.user.sub).catch(() => {res.status(401).end()})

    reportStore.deleteById(req.params.objectId, (response) => {
        if(!response){
            res.status(404).end()
            return
        }else{
            res.status(204).end()
        }
    })
})


function IsAuthor(messageId, userId){
    return new Promise((resolve, reject) => {
        reportStore.getById(messageId, (response) => {
            if(!response) reject(new Error("Comment not found"))
            else{
                if(response.userId == userId) resolve()
                else reject(new Error("Is not the author"))
            }
        })
    })
}


module.exports = router
var MongoClient = require('mongodb').MongoClient
var ObjectID = require('mongodb').ObjectID

module.exports = class _modelTemplate {
    constructor(collectionName) {
        this.databaseName = process.env.MONGO_DB_NAME
        this.collectionName = collectionName
    }

    create(newItem, callback){
        let thisDB = this.databaseName, thisCol = this.collectionName
        //  Create MongoDB ObjectID and get Timestamp
        newItem._id = ObjectID()
        newItem.date = newItem._id.getTimestamp()
    
        MongoClient.connect(process.env.MONGO_URI, {useNewUrlParser: true, useUnifiedTopology: true}, function(err, client) {
            if(err){
                console.log("MongoDB Connection Error:\n",err)
                return callback(null, err)
            }
    
            console.log("Connected to MongoDB " + client.s.options.replicaSet + " " + client.s.options.dbName)
            let selected_col = client.db(thisDB).collection(thisCol)
    
            //MONGODB OPERATION: INSERTONE
            selected_col.insertOne(newItem, function(err, res) {
                client.close()
                if(err) return callback(null, err)
                else return callback(newItem)
            })
        })
    }

    getBySettings(settings, sort, skip, limit, callback){
        let thisDB = this.databaseName, thisCol = this.collectionName
        MongoClient.connect(process.env.MONGO_URI, {useNewUrlParser: true, useUnifiedTopology: true}, function(err, client) {
            if(err){
                console.log("MongoDB Connection Error:\n",err)
                return callback(null, err)
            }
    
            console.log("Connected to MongoDB " + client.s.options.replicaSet + " " + client.s.options.dbName)
            let selected_col = client.db(thisDB).collection(thisCol)
    
            //  MONGODB OPERATION: FIND
            selected_col.find(settings).sort(sort).skip(skip).limit(limit).toArray(function(err, res) {
                client.close()
                if(err){
                    console.log(err)
                    return callback(null, err)
                }
                else return callback(res)
            })
        })
    }

    getById(id, callback){
        let thisDB = this.databaseName, thisCol = this.collectionName
        let settings = {"_id": ObjectID(id)}
    
        MongoClient.connect(process.env.MONGO_URI, {useNewUrlParser: true, useUnifiedTopology: true}, function(err, client) {
            if(err){
                console.log("MongoDB Connection Error:\n",err)
                return callback(null, err)
            }
    
            console.log("Connected to MongoDB " + client.s.options.replicaSet + " " + client.s.options.dbName)
            let selected_col = client.db(thisDB).collection(thisCol)
    
            //  MONGODB OPERATION: FIND
            selected_col.findOne(settings, function(err, res) {
                client.close()
                if(err) return callback(null, err)
                else return callback(res)
            })
        })
    }

    getCountAll(settings, callback){
        let thisDB = this.databaseName, thisCol = this.collectionName
        MongoClient.connect(process.env.MONGO_URI, {useNewUrlParser: true, useUnifiedTopology: true}, function(err, client) {
            if(err){
                console.log("MongoDB Connection Error:\n",err)
                return callback(null, err)
            }
    
            console.log("Connected to MongoDB " + client.s.options.replicaSet + " " + client.s.options.dbName)
            let selected_col = client.db(thisDB).collection(thisCol)
    
            //  MONGODB OPERATION: COUNT
            selected_col.countDocuments(settings, function(err, res) {
                client.close()
                if(err) return callback(null, err)
                else return callback(res)
            })
        })
    }

    deleteById(id, callback){
        let thisDB = this.databaseName, thisCol = this.collectionName
        let settings = {"_id": ObjectID(id)}
    
        MongoClient.connect(process.env.MONGO_URI, {useNewUrlParser: true, useUnifiedTopology: true}, function(err, client) {
            if(err){
                console.log("MongoDB Connection Error:\n",err)
                return callback(null, err)
            }
    
            console.log("Connected to MongoDB " + client.s.options.replicaSet + " " + client.s.options.dbName)
            let selected_col = client.db(thisDB).collection(thisCol)
    
            //  MONGODB OPERATION: DELETEONE
            selected_col.deleteOne(settings, function(err, res) {
                client.close()
                if(err) return callback(null, err)
                else return callback(res.deletedCount)
            })
        })
    }
    
    updateById(id, updateData, callback){
        let thisDB = this.databaseName, thisCol = this.collectionName
        let settings = {"_id": ObjectID(id)}
    
        let update = {$set:{}}
        for (const [key, value] of Object.entries(updateData)){
            update.$set[key] = value
        }
    
        MongoClient.connect(process.env.MONGO_URI, {useNewUrlParser: true, useUnifiedTopology: true}, function(err, client) {
            if(err){
                console.log("MongoDB Connection Error:\n",err)
                return callback(null, err)
            }
    
            console.log("Connected to MongoDB " + client.s.options.replicaSet + " " + client.s.options.dbName)
            let selected_col = client.db(thisDB).collection(thisCol)
    
            //  MONGODB OPERATION: UPDATEONE
            selected_col.updateOne(settings, update, function(err, res) {
                client.close()
                if(err) return callback(null, err)
                else return callback(res)
            })
        })
    }

    addToSet(id, match, matchSettings, addSettings, callback){
        let thisDB = this.databaseName, thisCol = this.collectionName
        let settings = {"_id": ObjectID(id)}
        if(matchSettings != null) settings[match] = matchSettings

        MongoClient.connect(process.env.MONGO_URI, {useNewUrlParser: true, useUnifiedTopology: true}, function(err, client) {
            if(err){
                console.log("MongoDB Connection Error:\n",err)
                return callback(null, err)
            }

            console.log("Connected to MongoDB " + client.s.options.replicaSet + " " + client.s.options.dbName)
            let selected_col = client.db(thisDB).collection(thisCol)

            //  MONGODB OPERATION: UPDATEONE
            selected_col.updateOne(settings, addSettings, function(err, res) {
                client.close()
                if(err) return callback(null, err)
                else return callback(res)
            })
        })
    }
}
var MongoClient = require('mongodb').MongoClient
var ObjectID = require('mongodb').ObjectID

module.exports = class _modelTemplate {
    constructor(collectionName) {
        this.databaseName = process.env.MONGO_DB_NAME
        this.collectionName = collectionName
        this._db = null

        this.initMongoClient();
    }

    initMongoClient() {
        let _this = this
        let collectionName = _this.collectionName

        MongoClient.connect( process.env.MONGO_URI,  { useNewUrlParser: true,  useUnifiedTopology: true }, function( err, client ) {
            try {
                _this._db = client.db(process.env.MONGO_DB_NAME)
                console.log("Initiated MongoDB client for col "+ collectionName + " : " + client.s.options.replicaSet + " " + client.s.options.dbName)
            } catch (err) {
                console.log(err)
                console.log("Pausing MongoDB client for col "+ collectionName)
                setTimeout(() => { _this.initMongoClient() }, 1000 + Math.round(Math.random()*5000))
            }

            if(err){
                console.log("MongoDB Connection Error:\n",err)
                //return callback(null, err)
            }
        } );
    
    }

    create(newItem, callback){

        //  Create MongoDB ObjectID and get Timestamp
        newItem._id = ObjectID()
        newItem.date = newItem._id.getTimestamp()
    

        let selected_col = this._db.collection(this.collectionName)

        //MONGODB OPERATION: INSERTONE
        selected_col.insertOne(newItem, function(err, res) {
            if(err) return callback(null, err)
            else return callback(newItem)
        })
        
    }

    getBySettings(settings, sort, skip, limit, callback){

        let selected_col = this._db.collection(this.collectionName)

        //  MONGODB OPERATION: FIND
        selected_col.find(settings).sort(sort).skip(skip).limit(limit).toArray(function(err, res) {
        
            if(err){
                console.log(err)
                return callback(null, err)
            }
            else return callback(res)
        })

    }

    getById(id, callback){

        let settings = {"_id": ObjectID(id)}
        let selected_col = this._db.collection(this.collectionName)

        //  MONGODB OPERATION: FIND
        selected_col.findOne(settings, function(err, res) {
            if(err) return callback(null, err)
            else return callback(res)
        })
        
    }

    getCountAll(settings, callback){

        let selected_col = this._db.collection(this.collectionName)

        //  MONGODB OPERATION: COUNT
        selected_col.countDocuments(settings, function(err, res) {
            if(err) return callback(null, err)
            else return callback(res)
        })
        
    }

    deleteById(id, callback){

        let settings = {"_id": ObjectID(id)}
        let selected_col = this._db.collection(this.collectionName)

        //  MONGODB OPERATION: DELETEONE
        selected_col.deleteOne(settings, function(err, res) {
            if(err) return callback(null, err)
            else return callback(res.deletedCount)
        })
        
    }

    deleteBySettings(settings, callback){

        let selected_col = this._db.collection(this.collectionName)

        //  MONGODB OPERATION: DELETEONE
        selected_col.deleteMany(settings, function(err, res) {
            if(err) return callback(null, err)
            else return callback(res.deletedCount)
        })
        
    }
    
    updateById(id, updateData, callback){

        let settings = {"_id": ObjectID(id)}
    
        let update = {$set:{}}
        for (const [key, value] of Object.entries(updateData)){
            update.$set[key] = value
        }
    
    
        let selected_col = this._db.collection(this.collectionName)

        //  MONGODB OPERATION: UPDATEONE
        selected_col.updateOne(settings, update, function(err, res) {
            if(err) return callback(null, err)
            else return callback(res)
        })
        
    }

    addToSet(id, match, matchSettings, addSettings, callback){

        let settings = {"_id": ObjectID(id)}
        if(matchSettings != null) settings[match] = matchSettings

        let selected_col = this._db.collection(this.collectionName)

        //  MONGODB OPERATION: UPDATEONE
        selected_col.updateOne(settings, addSettings, function(err, res) {
            if(err) return callback(null, err)
            else return callback(res)
        })
        
    }
}
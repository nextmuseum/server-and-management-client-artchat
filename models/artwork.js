var MongoClient = require('mongodb').MongoClient;
var ObjectID = require('mongodb').ObjectID;

const thisDB = "art_db";
const thisCol = "artwork_col";

exports.create = function(newArtwork, callback){
    //  Create MongoDB ObjectID and get Timestamp
    newArtwork._id = ObjectID();
    newArtwork.date = newArtwork._id.getTimestamp();

    MongoClient.connect(process.env.MONGO_URI, {useNewUrlParser: true, useUnifiedTopology: true}, function(err, client) {
        if(err){
            console.log("MongoDB Connection Error:\n",err);
            return callback(null);
        }

        console.log("Connected to MongoDB " + client.s.options.replicaSet + " " + client.s.options.dbName);
        let selected_col = client.db(thisDB).collection(thisCol);

        //MONGODB OPERATION: INSERTONE
        selected_col.insertOne(newArtwork, function(err, res) {
            client.close();
            if(err) return callback(null);
            else return callback(newArtwork);
        });
    });
}

exports.getBySettings = function(settings, sort, skip, limit, callback){
    MongoClient.connect(process.env.MONGO_URI, {useNewUrlParser: true, useUnifiedTopology: true}, function(err, client) {
        if(err){
            console.log("MongoDB Connection Error:\n",err);
            return callback(null);
        }

        console.log("Connected to MongoDB " + client.s.options.replicaSet + " " + client.s.options.dbName);
        let selected_col = client.db(thisDB).collection(thisCol);

        //  MONGODB OPERATION: FIND
        selected_col.find(settings).sort(sort).skip(skip).limit(limit).toArray(function(err, res) {
            client.close();
            if(err){
                console.log(err);
                return callback(null);
            }
            else return callback(res);
        });
    });
}

exports.getByID = function(id, callback){
    let settings = {"_id": ObjectID(id)};

    MongoClient.connect(process.env.MONGO_URI, {useNewUrlParser: true, useUnifiedTopology: true}, function(err, client) {
        if(err){
            console.log("MongoDB Connection Error:\n",err);
            return callback(null);
        }

        console.log("Connected to MongoDB " + client.s.options.replicaSet + " " + client.s.options.dbName);
        let selected_col = client.db(thisDB).collection(thisCol);

        //  MONGODB OPERATION: FIND
        selected_col.findOne(settings, function(err, res) {
            client.close();
            if(err) return callback(null);
            else return callback(res);
        });
    });
}

exports.getCountAll = function(settings, callback){
    MongoClient.connect(process.env.MONGO_URI, {useNewUrlParser: true, useUnifiedTopology: true}, function(err, client) {
        if(err){
            console.log("MongoDB Connection Error:\n",err);
            return callback(null);
        }

        console.log("Connected to MongoDB " + client.s.options.replicaSet + " " + client.s.options.dbName);
        let selected_col = client.db(thisDB).collection(thisCol);

        //  MONGODB OPERATION: COUNT
        selected_col.countDocuments(settings, function(err, res) {
            client.close();
            if(err) return callback(null);
            else return callback(res);
        });
    });
}
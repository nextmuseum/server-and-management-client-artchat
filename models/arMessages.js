var MongoClient = require('mongodb').MongoClient;
var ObjectID = require('mongodb').ObjectID;

const thisDB = "art_db";
const thisCol = "arMessages_col";

exports.create = function(newArMessage, callback){
    //  Create MongoDB ObjectID and get Timestamp
    newArMessage._id = ObjectID();
    newArMessage.date = newArMessage._id.getTimestamp();

    MongoClient.connect(process.env.MONGO_URI, {useNewUrlParser: true, useUnifiedTopology: true}, function(err, client) {
        if(err){
            console.log("MongoDB Connection Error:\n",err);
            return callback(null);
        }

        console.log("Connected to MongoDB " + client.s.options.replicaSet + " " + client.s.options.dbName);
        let selected_col = client.db(thisDB).collection(thisCol);

        //MONGODB OPERATION: INSERTONE
        selected_col.insertOne(newArMessage, function(err, res) {
            client.close();
            if(err) return callback(null);
            else return callback(newArMessage);
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

exports.deleteByID = function(id, callback){
    let settings = {"_id": ObjectID(id)};

    MongoClient.connect(process.env.MONGO_URI, {useNewUrlParser: true, useUnifiedTopology: true}, function(err, client) {
        if(err){
            console.log("MongoDB Connection Error:\n",err);
            return callback(null);
        }

        console.log("Connected to MongoDB " + client.s.options.replicaSet + " " + client.s.options.dbName);
        let selected_col = client.db(thisDB).collection(thisCol);

        //  MONGODB OPERATION: DELETEONE
        selected_col.deleteOne(settings, function(err, res) {
            client.close();
            if(err) return callback(null);
            else return callback(res.deletedCount);
        });
    });
}

exports.updateByID = function(id, updateData, callback){
    let settings = {"_id": ObjectID(id)};

    let update = {$set:{}};
    for (const [key, value] of Object.entries(updateData)){
        update.$set[key] = value;
    }

    MongoClient.connect(process.env.MONGO_URI, {useNewUrlParser: true, useUnifiedTopology: true}, function(err, client) {
        if(err){
            console.log("MongoDB Connection Error:\n",err);
            return callback(null);
        }

        console.log("Connected to MongoDB " + client.s.options.replicaSet + " " + client.s.options.dbName);
        let selected_col = client.db(thisDB).collection(thisCol);

        //  MONGODB OPERATION: UPDATEONE
        selected_col.updateOne(settings, update, function(err, res) {
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
const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
const shortid = require("shortid");
// Connection URL
const url = require("../config.json").mongo;
// Database Name
const dbName = 'fmk';
var db = null
    // Use connect method to connect to the server
MongoClient.connect(url, function(err, client) {
    assert.equal(null, err);
    console.log("Connected successfully to database");
    db = client.db(dbName);
});

module.exports.addGame = async(people) => {
    var id = shortid.generate();
    await db.collection("games").insertOne({
        id: id,
        people: people,
        players: []
    })
    return id
}
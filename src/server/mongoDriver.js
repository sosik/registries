var MongoClient = require('mongodb').MongoClient;
var ObjectID = require('mongodb').ObjectID;
var QueryFilter = require(process.cwd() + '/build/server/QueryFilter');

module.exports = require('./_mongoDriver')(MongoClient, ObjectID, QueryFilter);

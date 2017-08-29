'use strict';
const webpush = require('web-push');
const AWS = require("aws-sdk");

exports.handler = (event, context, callback) => {
    const vapidKeys = webpush.generateVAPIDKeys();
    var docClient = new AWS.DynamoDB.DocumentClient();
    var _dt = ((new Date()) - 0);

    var sparams = {
        TableName: "notification_endpoints"
    };

    docClient.scan(sparams, function(err, data) {
        if (err) {
            callback("Unable to query. Error:", JSON.stringify(err, null, 2));
        } else {
            console.log("Query succeeded.");

            if (!data || data.Items.length <= 0) {
                var params = {
                    TableName: "notification_endpoints",
                    Item: {
                        id: 1,
                        publicKey: vapidKeys.publicKey,
                        privateKey: vapidKeys.privateKey,
                        timeStamp: _dt
                    }
                };
                docClient.put(params, function(err, data) {
                    if (err) {
                        callback({
                            "isBase64Encoded": false,
                            "statusCode": 500,
                            "headers": { "Access-Control-Allow-Origin": "https://d3p1mup9z760d1.cloudfront.net" },
                            "body": "Unable to add item. Error JSON: " + JSON.stringify(err, null, 2)
                        }, null);
                    } else {
                        callback(null, {
                            "isBase64Encoded": false,
                            "statusCode": 200,
                            "headers": { "Access-Control-Allow-Origin": "https://d3p1mup9z760d1.cloudfront.net" },
                            "body": JSON.stringify(vapidKeys)
                        });
                    }
                });
            } else {
                var d = data.Items[0];
                // This is the same output of calling JSON.stringify on a PushSubscription

                var dparams = {
                    TableName: "notification_endpoints",
                    Key: {
                        "id": d.id
                    }
                };

                if (((_dt - d.timeStamp) / 1000 / 60 / 60) >= 24) {
                    docClient.delete(dparams, function(err, data) {
                        if (err) {
                            callback("Unable to delete item. Error JSON:", JSON.stringify(err, null, 2));
                        } else {
                            var params = {
                                TableName: "notification_endpoints",
                                Item: {
                                    id: 1,
                                    publicKey: vapidKeys.publicKey,
                                    privateKey: vapidKeys.privateKey,
                                    timeStamp: _dt
                                }
                            };
                            docClient.put(params, function(err, data) {
                                if (err) {
                                    callback({
                                        "isBase64Encoded": false,
                                        "statusCode": 500,
                                        "headers": { "Access-Control-Allow-Origin": "https://d3p1mup9z760d1.cloudfront.net" },
                                        "body": "Unable to add item. Error JSON: " + JSON.stringify(err, null, 2)
                                    }, null);
                                } else {
                                    callback(null, {
                                        "isBase64Encoded": false,
                                        "statusCode": 200,
                                        "headers": { "Access-Control-Allow-Origin": "https://d3p1mup9z760d1.cloudfront.net" },
                                        "body": JSON.stringify(vapidKeys)
                                    });
                                }
                            });
                        }
                    });
                } else {
                    callback(null, {
                        "isBase64Encoded": false,
                        "statusCode": 200,
                        "headers": { "Access-Control-Allow-Origin": "https://d3p1mup9z760d1.cloudfront.net" },
                        "body": JSON.stringify(d)
                    });
                }
            }
        }
    });
};
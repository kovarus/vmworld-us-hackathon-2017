'use strict';
const webpush = require('web-push');
const AWS = require("aws-sdk");

exports.handler = (event, context, callback) => {
    var sub = JSON.parse(event.body).sub;
    var docClient = new AWS.DynamoDB.DocumentClient();
    var dparams = {
        TableName: "endpoint_data",
        Key: {
            "id": 1
        }
    };

    docClient.delete(dparams, function(err, data) {
        if (err) {
            callback("Unable to delete item. Error JSON:", JSON.stringify(err, null, 2));
        } else {
            var params = {
                TableName: "endpoint_data",
                Item: {
                    id: 1,
                    endpoint: sub.endpoint,
                    keys: sub.keys
                }
            };
            docClient.put(params, function(err, data) {
                if (err) {
                    callback({
                        "statusCode": 500,
                        "isBase64Encoded": false,
                        "headers": { "Access-Control-Allow-Origin": "https://d3p1mup9z760d1.cloudfront.net" },
                        "body": JSON.stringify(err, null, 2)
                    }, null);
                } else {
                    callback(null, {
                        "isBase64Encoded": false,
                        "headers": { "Access-Control-Allow-Origin": "https://d3p1mup9z760d1.cloudfront.net" },
                        "statusCode": 200
                    });
                }
            });
        }
    });
};
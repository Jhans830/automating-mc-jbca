'use strict';
var util = require('util');
var request = require('request');
// Deps
const Path = require('path');
const JWT = require(Path.join(__dirname, '..', 'lib', 'jwtDecoder.js'));
var util = require('util');
var http = require('https');

exports.logExecuteData = [];

function logData(req) {
  exports.logExecuteData.push({
    body: req.body,
    headers: req.headers,
    trailers: req.trailers,
    method: req.method,
    url: req.url,
    params: req.params,
    query: req.query,
    route: req.route,
    cookies: req.cookies,
    ip: req.ip,
    path: req.path,
    host: req.host,
    fresh: req.fresh,
    stale: req.stale,
    protocol: req.protocol,
    secure: req.secure,
    originalUrl: req.originalUrl
  });
  console.log("body: " + util.inspect(req.body));
  console.log("headers: " + req.headers);
  console.log("trailers: " + req.trailers);
  console.log("method: " + req.method);
  console.log("url: " + req.url);
  console.log("params: " + util.inspect(req.params));
  console.log("query: " + util.inspect(req.query));
  console.log("route: " + req.route);
  console.log("cookies: " + req.cookies);
  console.log("ip: " + req.ip);
  console.log("path: " + req.path);
  console.log("host: " + req.host);
  console.log("fresh: " + req.fresh);
  console.log("stale: " + req.stale);
  console.log("protocol: " + req.protocol);
  console.log("secure: " + req.secure);
  console.log("originalUrl: " + req.originalUrl);
}

/*
 * POST Handler for / route of Activity (this is the edit route).
 */
exports.edit = function(req, res) {
  // Data from the req and put it in an array accessible to the main app.
  //console.log( req.body );
  logData(req);
  res.send(200, 'Edit');
};

/*
 * POST Handler for /save/ route of Activity.
 */
exports.save = function(req, res) {
  // Data from the req and put it in an array accessible to the main app.
  //console.log( req.body );
  logData(req);
  res.send(200, 'Save');
};

/*
 * POST Handler for /execute/ route of Activity.
 */
exports.execute = function(req, res) {
  // example on how to decode JWT
  JWT(req.body, process.env.jwtSecret, (err, decoded) => {

    // verification error -> unauthorized request
    if (err) {
      console.error(err);
      return res.status(401).end();
    }
    if (decoded && decoded.inArguments && decoded.inArguments.length > 0) {
      console.log(decoded);
      // decoded in arguments
      var decodedArgs = decoded.inArguments[0];
      var triggerKey = decodedArgs.customerKey;
      var prop = decodedArgs.prop
      var token = decodedArgs.tokens;
      // grab SFMC token
      var mcToken = token.fuel2token;
      var subKey = decodedArgs.subscriberKey;
      var http = require('http')
      // lookup contact attributes by subscriber key
      var body = JSON.stringify({
        "request": {
          "attributes": [{
              "key": "Contact.Email"
            },
            {
              "key": "Contact.Contact Key"
            }
          ]
        },
        "conditionSet": {
          "operator": "And",
          "conditionSets": [

          ],
          "conditions": [{
            "attribute": {
              "key": "Contact_Salesforce.ID"
            },
            "operator": "Equals",
            "value": {
              "items": [
                subKey
              ]
            }
          }]
        }
      });
      var authHead = "Bearer " + mcToken;
      var contactPath = process.env.endPoint + ".rest.marketingcloudapis.com/contacts/v1/attributes/search";
      request.post({
        headers: {
          "Content-Type": "application/json",
          "Authorization": authHead
        },
        url: contactPath,
        body: body
      }, function(error, response, body) {
        var contactData = body;
        // parse response and get contact data
        var json = JSON.parse(contactData.toString());
        var contactKey = json.items[0].values[0].value;
        var emailaddress = json.items[0].values[1].value;
        // prepare payload to deploy send
        var tsdBody = JSON.stringify({
          "To": {
            "Address": emailaddress,
            "SubscriberKey": contactKey,
            "ContactAttributes": {
              "SubscriberAttributes": {
                "someProp": prop,
              }
            }
          }
        });
        var triggerPath = process.env.endPoint + ".rest.marketingcloudapis.com/messaging/v1/messageDefinitionSends/key:" + triggerKey + "/send";
        request.post({
          headers: {
            "Content-Type": "application/json",
            "Authorization": authHead
          },
          url: triggerPath,
          body: tsdBody
        }, function(error, response, body) {
          console.log(body);
        });
      });
      logData(req);
      res.send(200, 'Execute');
    } else {
      console.error('inArguments invalid.');
      return res.status(400).end();
    }
  });
};


/*
 * POST Handler for /publish/ route of Activity.
 */
exports.publish = function(req, res) {
  // Data from the req and put it in an array accessible to the main app.
  //console.log( req.body );
  logData(req);
  res.send(200, 'Publish');
};

/*
 * POST Handler for /validate/ route of Activity.
 */
exports.validate = function(req, res) {
  // Data from the req and put it in an array accessible to the main app.
  //console.log( req.body );
  logData(req);
  res.send(200, 'Validate');
};
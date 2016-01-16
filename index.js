'use strict';

var alexa = require('alexa-app');
var app = new alexa.app('traffic');

var request = require('request');
var Promise = require('bluebird');

var locations = require('./locations');
var secrets = require('./secrets');

var classifications = [
  {
    max: -5,
    label: 'great'
  },
  {
    min: -4.99,
    max: 5,
    label: 'normal'
  },
  {
    min: 5.01,
    max: 25,
    label: 'slower'
  },
  {
    min: 25.01,
    max: 50,
    label: 'bad'
  },
  {
    min: 50.01,
    label: 'horrendous'
  }
];

var getTime = function (address) {
  return new Promise( function (resolve, reject) {
    request({
      method: 'GET',
      uri: 'https://maps.googleapis.com/maps/api/distancematrix/json',
      qs: {
        origins: locations.home,
        destinations: address,
        key: secrets.googleMapsApiKey,
        departure_time: 'now'
      }
    }, function (error, response, body) {
      body = JSON.parse(body);
      var duration = body.rows[0].elements[0].duration_in_traffic.text;
      var normalSecs = body.rows[0].elements[0].duration.value;
      var nowSecs = body.rows[0].elements[0].duration_in_traffic.value;

      resolve({
        duration: duration,
        normalSecs: normalSecs,
        nowSecs: nowSecs
      });
    });
  });
};

var classifyTraffic = function (now, normal) {
  var percentageChange = ((now/normal) - 1) * 100;
  var label = '';

  classifications.forEach(function (classification) {
    if (classification.label) {
      if (classification.min && classification.max && percentageChange >= classification.min && percentageChange <= classification.max ) {
        label = classification.label;
      } else if (classification.min && !classification.max && percentageChange >= classification.min) {
        label = classification.label;
      } else if (classification.max && !classification.min && percentageChange <= classification.max) {
        label = classification.label;
      }
    }
  });

  return label;
};

app.dictionary = {
  locations: [
    "work",
    "apple",
    "mike's work",
    "jennifer's work"
  ]
};

app.intent('trafficStatusIntent',
  {
    slots: {
      LOCATION: 'AMAZON.LITERAL',
    },
    'utterances': [
      'how is the traffic to {locations|LOCATION} right now',
      'how is traffic to {locations|LOCATION} right now',
      'how\'s the traffic to {locations|LOCATION} right now',
      'how\'s traffic to {locations|LOCATION} right now',
      'how is the traffic to {locations|LOCATION}',
      'how is traffic to {locations|LOCATION}',
      'how\'s the traffic to {locations|LOCATION}',
      'how\'s traffic to {locations|LOCATION}',
      'what\'s the traffic like to {locations|LOCATION}',
      'what\'s traffic like to {locations|LOCATION}'
    ]
  },
  function (alexaRequest, alexaResponse) {
    var location = alexaRequest.slot('LOCATION');
    var address = (locations[location]) ? locations[location] : locations.default;

    getTime(address).then(function (results) {
      // Not using .say() in order to respond with an SSML output
      alexaResponse.response.response.outputSpeech = {
        type: 'SSML',
        ssml: '<speak>Traffic is ' + classifyTraffic(results.nowSecs, results.normalSecs) + '. It should take <say-as interpret-as="time">' + results.duration.replace('mins', 'minutes') + '</say-as></speak>'
      };

      alexaResponse
        .send();
    });

    // Return false immediately so alexa-app doesn't send the response; The send() method will send it.
    return false;
  }
);

module.exports = {
  app: app,
  handler: app.lambda()
};
'use strict';

var app = require('./../index').app;
var fs = require('fs');

fs.writeFile('./resources/utterances.txt', app.utterances(), function (err) {
  if (err) {
    return console.log(err);
  }

  console.log('Utterances file saved');
});
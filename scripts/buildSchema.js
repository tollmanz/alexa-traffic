'use strict';

var app = require('./../index').app;
var fs = require('fs');

fs.writeFile('./resources/schema.json', app.schema(), function (err) {
  if (err) {
    return console.log(err);
  }

  console.log('Schema file saved');
});
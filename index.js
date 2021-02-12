'use strict';

if (process.env.ENVIRONMENT !== 'production') {
  require('dotenv').config();
}

var fs = require('fs'),
  http = require('http'),
  path = require('path');

var express = require("express");
var app = express();
var bodyParser = require('body-parser');
var database = require('./db');
var cors = require('cors')

//Nock mocking for testing
const nock = require('nock');
if (process.env.ENVIRONMENT === 'integration') {
  nock("https://api.deepai.org/api", { allowUnmocked: true })
  .post('/sentiment-analysis').times(100)
  .reply(200, {
      "id": "c7659eb6-4f04-4135-81a7-6debaccb3517",
      "output": [
          "Neutral"
      ]
  });
}


database.connect(false);

app.use(bodyParser.json({
  strict: false
}));
var oasTools = require('oas-tools');
var jsyaml = require('js-yaml');
var serverPort = process.env.PORT || 8080;

var spec = fs.readFileSync(path.join(__dirname, '/api/oas-doc.yaml'), 'utf8');
var oasDoc = jsyaml.safeLoad(spec);

var options_object = {
  controllers: path.join(__dirname, './controllers'),
  loglevel: 'info',
  strict: false,
  router: true,
  validator: true
};

oasTools.configure(options_object);

app.use(cors())




oasTools.initialize(oasDoc, app, function () {
  app.server = http.createServer(app).listen(serverPort, function () {
    console.log("App running at http://localhost:" + serverPort);
    console.log("________________________________________________________________");
    if (options_object.docs !== false) {
      console.log('API docs (Swagger UI) available on http://localhost:' + serverPort + '/docs');
      console.log("________________________________________________________________");
    }
  });
});

app.get('/', function (req, res) {
  res.send({
    info: "This API was generated using oas-generator!",
    name: oasDoc.info.title
  });
});


module.exports = app;


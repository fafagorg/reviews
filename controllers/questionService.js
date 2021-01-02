'use strict'


var questionModel = require("../models/question.model");

const responseOk = {
  "code": 201,
  "message": "Question created successfully"
};

const responseBodyIsMissing = {
  "code": 400,
  "message": "Request body is missing"
};

const responseUnexpectedError = {
  "code": 500,
  "message": "Unexpected error"
};

module.exports.getQuestions = function getQuestions(req, res, next) {
  res.send({
    message: 'This is the mockup controller for getQuestions'
  });
};

module.exports.addQuestion = function addQuestion(req, res, next) {
  console.log(req.question.value);
  if (!req.question.value) {
    return res.status(400).send(responseBodyIsMissing);

  }
  var question = new questionModel(req.question.value);
  console.log(question);

  question.save()
    .then(doc => {
      if (!doc || doc.length === 0) {
        return res.status(500).send(responseUnexpectedError);
      }

      res.status(201).send(responseOk);
    })
    .catch(err => {
      res.status(500).json(responseUnexpectedError);
    })
};

module.exports.findQuestionByid = function findQuestionByid(req, res, next) {

 questionModel.findOne({id: req.id.value}, function(err, question){
  res.status(200).send(JSON.stringify(question))
  })
};

module.exports.deleteQuestion = function deleteQuestion(req, res, next) {
  res.send({
    message: 'This is the mockup controller for deleteQuestion'
  });
};

module.exports.updateQuestion = function updateQuestion(req, res, next) {
  res.send({
    message: 'This is the mockup controller for updateQuestion'
  });
};
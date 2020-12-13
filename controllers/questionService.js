'use strict'

module.exports.getQuestions = function getQuestions(req, res, next) {
  res.send({
    message: 'This is the mockup controller for getQuestions'
  });
};

module.exports.addQuestion = function addQuestion(req, res, next) {
  res.send({
    message: 'This is the mockup controller for addQuestion'
  });
};

module.exports.findQuestionByid = function findQuestionByid(req, res, next) {
  res.send({
    message: 'This is the mockup controller for findQuestionByid'
  });
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
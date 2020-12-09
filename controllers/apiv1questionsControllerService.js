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
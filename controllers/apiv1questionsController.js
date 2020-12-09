'use strict'

var varapiv1questionsController = require('./apiv1questionsControllerService');

module.exports.getQuestions = function getQuestions(req, res, next) {
  varapiv1questionsController.getQuestions(req.swagger.params, res, next);
};

module.exports.addQuestion = function addQuestion(req, res, next) {
  varapiv1questionsController.addQuestion(req.swagger.params, res, next);
};
'use strict'

var varapiv1questionsidController = require('./apiv1questionsidControllerService');

module.exports.findQuestionByid = function findQuestionByid(req, res, next) {
  varapiv1questionsidController.findQuestionByid(req.swagger.params, res, next);
};

module.exports.deleteQuestion = function deleteQuestion(req, res, next) {
  varapiv1questionsidController.deleteQuestion(req.swagger.params, res, next);
};

module.exports.updateQuestion = function updateQuestion(req, res, next) {
  varapiv1questionsidController.updateQuestion(req.swagger.params, res, next);
};
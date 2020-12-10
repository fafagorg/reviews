'use strict'

questionController = require('./questionService');

module.exports.getQuestions = function getQuestions(req, res, next) {
 questionController.getQuestions(req.swagger.params, res, next);
};

module.exports.addQuestion = function addQuestion(req, res, next) {
 questionController.addQuestion(req.swagger.params, res, next);
};

module.exports.findQuestionByid = function findQuestionByid(req, res, next) {
 questionController.findQuestionByid(req.swagger.params, res, next);
};

module.exports.deleteQuestion = function deleteQuestion(req, res, next) {
 questionController.deleteQuestion(req.swagger.params, res, next);
};

module.exports.updateQuestion = function updateQuestion(req, res, next) {
 questionController.updateQuestion(req.swagger.params, res, next);
};
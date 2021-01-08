'use strict'

var questionService = require('./questionService');

module.exports.getQuestions = function getQuestions(req, res, next) {
    questionService.getQuestions(req.swagger.params, res, req.headers, next);
};

module.exports.addQuestion = function addQuestion(req, res, next) {
    questionService.addQuestion(req.swagger.params, res, req.headers, next);
};

module.exports.findQuestionByid = function findQuestionByid(req, res, next) {
    questionService.findQuestionByid(req.swagger.params, res, req.headers, next);
};

module.exports.deleteQuestion = function deleteQuestion(req, res, next) {
    questionService.deleteQuestion(req.swagger.params, res, req.headers, next);
};

module.exports.updateQuestion = function updateQuestion(req, res, next) {
    questionService.updateQuestion(req.swagger.params, res, req.headers, next);
};

module.exports.findQuestionsByProductId = function findQuestionsByProductId(req, res, next) {
    questionService.findQuestionsByProductId(req.swagger.params, res, req.headers, next);
};

module.exports.deleteQuestionsByProductId = function deleteQuestionsByProductId(req, res, next) {
    questionService.deleteQuestionsByProductId(req.swagger.params, res, req.headers, next);
};

module.exports.findQuestionRepliesById = function findQuestionRepliesById(req, res, next) {
    questionService.findQuestionRepliesById(req.swagger.params, res, req.headers, next);
};

module.exports.addReplyToQuestion = function addReplyToQuestion(req, res, next) {
    questionService.addReplyToQuestion(req.swagger.params, res, req.headers, next);
};

module.exports.findQuestionSingleReply = function findQuestionSingleReply(req, res, next) {
    questionService.findQuestionSingleReply(req.swagger.params, res, req.headers, next);
};

module.exports.deleteReplyFromQuestion = function deleteReplyFromQuestion(req, res, next) {
    questionService.deleteReplyFromQuestion(req.swagger.params, res, req.headers, next);
};

module.exports.updateReplyFromQuestion = function updateReplyFromQuestion(req, res, next) {
    questionService.updateReplyFromQuestion(req.swagger.params, res, req.headers, next);
};
'use strict'

var reviewService = require('./reviewService');

module.exports.getReviews = function getReviews(req, res, next) {
 reviewService.getReviews(req.swagger.params, res, req.headers, next);
};

module.exports.addReview = function addReview(req, res, next) {
 reviewService.addReview(req.swagger.params, res, req.headers, next);
};

module.exports.findReviewByid = function findReviewByid(req, res, next) {
  reviewService.findReviewByid(req.swagger.params, res, req.headers, next);
};

module.exports.deleteReview = function deleteReview(req, res, next) {
  reviewService.deleteReview(req.swagger.params, res, req.headers, next);
};

module.exports.updateReview = function updateReview(req, res, next) {
  reviewService.updateReview(req.swagger.params, res, req.headers, next);
};

module.exports.findReviewsByClientId = function findReviewsByClientId(req, res, next) {
  reviewService.findReviewsByClientId(req.swagger.params, res, req.headers, next);
 };

module.exports.deleteReviewsByClientId = function deleteReviewsByClientId(req, res, next) {
 reviewService.deleteReviewsByClientId(req.swagger.params, res, req.headers, next);
};

module.exports.findReviewsByProductId = function findReviewsByProductId(req, res, next) {
 reviewService.findReviewsByProductId(req.swagger.params, res, req.headers, next);
};

module.exports.deleteReviewsByProductId = function deleteReviewsByProductId(req, res, next) {
 reviewService.deleteReviewsByProductId(req.swagger.params, res, req.headers, next);
};

module.exports.findReviewCommentsById = function findReviewCommentsById(req, res, next) {
  reviewService.findReviewCommentsById(req.swagger.params, res, req.headers, next);
};

module.exports.addCommentToReview = function addCommentToReview(req, res, next) {
  reviewService.addCommentToReview(req.swagger.params, res, req.headers, next);
};

module.exports.findReviewSingleComment = function findReviewSingleComment(req, res, next) {
  reviewService.findReviewSingleComment(req.swagger.params, res, req.headers, next);
};

module.exports.deleteCommentFromReview = function deleteCommentFromReview(req, res, next) {
  reviewService.deleteCommentFromReview(req.swagger.params, res, req.headers, next);
};

module.exports.updateCommentFromReview = function updateCommentFromReview(req, res, next) {
  reviewService.updateCommentFromReview(req.swagger.params, res, req.headers, next);
};
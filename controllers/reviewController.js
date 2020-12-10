'use strict'

var reviewService = require('./reviewControllerService');

module.exports.getReviews = function getReviews(req, res, next) {
 reviewService.getReviews(req.swagger.params, res, next);
};

module.exports.addReview = function addReview(req, res, next) {
 reviewService.addReview(req.swagger.params, res, next);
};

module.exports.findReviewByid = function findReviewByid(req, res, next) {
  reviewService.findReviewByid(req.swagger.params, res, next);
};

module.exports.deleteReview = function deleteReview(req, res, next) {
  reviewService.deleteReview(req.swagger.params, res, next);
};

module.exports.updateReview = function updateReview(req, res, next) {
  reviewService.updateReview(req.swagger.params, res, next);
};
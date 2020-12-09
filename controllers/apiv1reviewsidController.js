'use strict'

var varapiv1reviewsidController = require('./apiv1reviewsidControllerService');

module.exports.findReviewByid = function findReviewByid(req, res, next) {
  varapiv1reviewsidController.findReviewByid(req.swagger.params, res, next);
};

module.exports.deleteReview = function deleteReview(req, res, next) {
  varapiv1reviewsidController.deleteReview(req.swagger.params, res, next);
};

module.exports.updateReview = function updateReview(req, res, next) {
  varapiv1reviewsidController.updateReview(req.swagger.params, res, next);
};
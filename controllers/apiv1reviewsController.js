'use strict'

var varapiv1reviewsController = require('./apiv1reviewsControllerService');

module.exports.getReviews = function getReviews(req, res, next) {
  varapiv1reviewsController.getReviews(req.swagger.params, res, next);
};

module.exports.addReview = function addReview(req, res, next) {
  varapiv1reviewsController.addReview(req.swagger.params, res, next);
};
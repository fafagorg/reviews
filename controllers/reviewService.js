'use strict'

var ReviewModel = require("../models/review.model");

const responseOk = {
  "code": 201,
  "message": "Review created successfully"
};

const responseBodyIsMissing = {
  "code": 400,
  "message": "Request body is missing"
};

const responseUnexpectedError = {
  "code": 500,
  "message": "Unexpected error"
};

module.exports.getReviews = function getReviews(req, res, next) {
  res.send({
    message: 'This is the mockup controller for getReviews'
  });
};

// POST /api/v1/reviews
module.exports.addReview = function addReview(req, res, next) {
  console.log(req.review.value);
  if (!req.review.value) {
    return res.status(400).send(responseBodyIsMissing);

  }

  var review = new ReviewModel(req.review.value);
  console.log(review);

  review.save()
    .then(doc => {
      if (!doc || doc.length === 0) {
        return res.status(500).send(responseUnexpectedError);
      }

      res.status(201).send(responseOk);
    })
    .catch(err => {
      res.status(500).json(responseUnexpectedError);
    })

  //res.send({
  //message: 'This is the mockup controller for addReview'
  //});
};
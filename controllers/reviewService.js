'use strict'

const { v4: uuidv4 } = require('uuid');
var ReviewModel = require("../models/review.model");


// GET /api/v1/reviews
module.exports.getReviews = function getReviews(req, res, next) {
  ReviewModel.find().lean()
    .then(doc => {
      removeUnnecessaryAttributes(doc);

      res.send(doc);
    })
    .catch(err => {
      res.status(500).send(err);
    });
};

// POST /api/v1/reviews
module.exports.addReview = function addReview(req, res, next) {
  if (!req.review.value) {
    return res.status(400).send(getResponse(400, "Request body is missing"));
  }

  var review = new ReviewModel(req.review.value);

  review.id = uuidv4();
  review.dateCreated = new Date().toISOString();

  review.save()
    .then(doc => {
      if (!doc || doc.length === 0) {
        return res.status(500).send(getResponse(500, "Unexpected error"));
      }

      res.status(201).send(getResponse(201, "Review created successfully"));
    })
    .catch(err => {
      res.status(500).send(getResponse(500, err));
    })
};

// GET /api/v1/reviews/{id}
module.exports.findReviewByid = function findReviewByid(req, res, next) {
  ReviewModel.findOne({
    id: req.id.value
  }).lean()
    .then(doc => {
      if (doc === null) {
        return res.status(404).send(getResponse(404, "Review not found."));
      }
      removeUnnecessaryAttributes(doc);

      res.send(doc);
    })
    .catch(err => {
      res.status(500).send(err);
    });
}

// DELETE /api/v1/reviews/{id}
module.exports.deleteReview = function deleteReview(req, res, next) {
  ReviewModel.deleteOne({
    id: req.id.value
  })
    .then(doc => {
      if (doc.deletedCount > 0) {
        return res.status(204).send("Review deleted.");
      }

      return res.status(404).send(getResponse(404, "Review not found."));
    })
    .catch(err => {
      res.status(500).send(err);
    });
}

// PUT /api/v1/reviews/{id}
module.exports.updateReview = function updateReview(req, res, next) {
  if (!req.review.value) {
    return res.status(400).send(getResponse(400, "Request body is missing"));
  }

  ReviewModel.findOneAndUpdate({
    id: req.id.value
  }, req.review.value, {
    new: true,
    useFindAndModify: false
  }).lean()
    .then(doc => {
      if (doc === null) {
        return res.status(404).send(getResponse(404, "Review not found."));
      }

      return res.status(204).send("Review updated.");
    })
    .catch(err => {
      res.status(500).send(err);
    });
};

// ----------------- Helper methods -----------------

/**
 * Gets the response depending on the code and the message given
 * 
 * @param {number} code 
 * @param {string} message 
 */
function getResponse(code, message) {
  return {
    "code": code,
    "message": message
  }
}

/**
 * Removes the unnecessary attributes from a list of reviews, those attributes are '_id', '__v' and '_id' from the comments
 * 
 * @param {*} reviews 
 */
function removeUnnecessaryAttributes(reviews) {
  if (Array.isArray(reviews)) {
    reviews.forEach(function (review) {
      removeUnnecessaryAttributesOnSingleReview(review);
    });
  } else {
    removeUnnecessaryAttributesOnSingleReview(reviews);
  }

}

/**
 * Removes the unnecessary attributes from a single review
 * 
 * @param {*} review 
 */
function removeUnnecessaryAttributesOnSingleReview(review) {
  delete review["_id"];
  delete review["__v"];

  if (review.hasOwnProperty("comments")) {
    review.comments.forEach(function (comment) {
      delete comment["_id"];
    });
  }
}
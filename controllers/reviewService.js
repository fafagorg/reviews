'use strict'

const { v4: uuidv4 } = require('uuid');
const axios = require('axios')

var FormData = require('form-data');
const AuthResource = require('../resources/authResource')
var ReviewModel = require("../models/review.model");

// GET /api/v1/reviews
module.exports.getReviews = async function getReviews(req, res, headers, next) {
  try {
      let body = await AuthResource.auth(headers.authorization);
      let doc = await ReviewModel.find().lean();
      removeUnnecessaryAttributes(doc);
      res.send(doc); 
  } catch (error) {
      console.log(error);
      res.status(500).send(getResponse(500, error.error.err));
  }
}


// module.exports.getReviews = function getReviews(req, res, headers, next) {
//   AuthResource.auth(headers.authorization).then((body) => {
//     ReviewModel.find().lean()
//       .then(doc => {
//         removeUnnecessaryAttributes(doc);
//         res.send(doc);
//       })
//       .catch(err => {
//         return res.status(500).send(err);
//       });
//   }).catch((error) => {
//     console.log(error);
//     res.status(500).send(getResponse(500, error.error.err));
//   });
// }

// POST /api/v1/reviews

module.exports.addReview = async function addReview(req, res, headers, next) {
  AuthResource.auth(headers.authorization).then(async function (body) {
  
    var data = new FormData();
    data.append('text', req.review.value.title);
   
    var config = {
      method: 'post',
      url: 'https://api.deepai.org/api/sentiment-analysis',
      headers: {
        'api-key': process.env.API_KEY_DEEPAI,
        ...data.getHeaders()
      },
      data: data
    };
    var resp = await axios(config)

    var keys = []
    for (var key in req.review.value) {
      keys.push(key);
    }

    if (keys.length === 0) {
      return res.status(400).send(getResponse(400, "Request body is missing."));
    }
    var review = new ReviewModel(req.review.value);

    review.id = uuidv4();
    review.dateCreated = new Date().toISOString();
    review.externalScore = resp.data.output[0]


    ReviewModel.create(review)
      .then(doc => {
        if (!doc || doc.length === 0) {
          return res.status(500).send(getResponse(500, "Unexpected error."));
        }

        res.status(201).send(getResponse(201, "Review created successfully."));
      })
      .catch(err => {
        res.status(500).send(getResponse(500, err));
      })
  }).catch((error) => {
    console.log(error)
    res.status(500).send(getResponse(500, error.error.err));
  });
};

// GET /api/v1/reviews/{id}
module.exports.findReviewByid = function findReviewByid(req, res, headers, next) {
  AuthResource.auth(headers.authorization).then((body) => {
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
  }).catch((error) => {
    res.status(500).send(getResponse(500, error.error.err));
  });
}

// DELETE /api/v1/reviews/{id}
module.exports.deleteReview = function deleteReview(req, res, headers, next) {
  AuthResource.auth(headers.authorization).then((body) => {
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
  }).catch((error) => {
    res.status(500).send(getResponse(500, error.error.err));
  });
}

// PUT /api/v1/reviews/{id}
module.exports.updateReview = function updateReview(req, res, headers, next) {
  AuthResource.auth(headers.authorization).then((body) => {
    var keys = []
    for (var key in req.review.value) {
      keys.push(key);
    }

    if (keys.length === 0) {
      return res.status(400).send(getResponse(400, "Request body is missing."));
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
  }).catch((error) => {
    res.status(500).send(getResponse(500, error.error.err));
  });
};

// GET /api/v1/reviews/client/{clientId}
module.exports.findReviewsByClientId = function findReviewsByClientId(req, res, headers, next) {
  AuthResource.auth(headers.authorization).then((body) => {
    ReviewModel.find({
      reviewedClientId: req.clientId.value
    }).lean()
      .then(doc => {
        removeUnnecessaryAttributes(doc);

        res.send(doc);
      })
      .catch(err => {
        res.status(500).send(err);
      });
  }).catch((error) => {
    res.status(500).send(getResponse(500, error.error.err));
  });
}

// DELETE /api/v1/reviews/client/{clientId}
module.exports.deleteReviewsByClientId = function deleteReviewsByClientId(req, res, headers, next) {
  AuthResource.auth(headers.authorization).then((body) => {
    ReviewModel.deleteMany({
      reviewedClientId: req.clientId.value
    })
      .then(doc => {
        if (doc.deletedCount > 0) {
          return res.status(204).send("Reviews deleted.");
        }

        return res.status(404).send(getResponse(404, "Client id not found."));
      })
      .catch(err => {
        res.status(500).send(err);
      });
  }).catch((error) => {
    res.status(500).send(getResponse(500, error.error.err));
  });
}

// GET /api/v1/reviews/product/{productId}
module.exports.findReviewsByProductId = function findReviewsByProductId(req, res, headers, next) {
  AuthResource.auth(headers.authorization).then((body) => {
    ReviewModel.find({
      reviewedProductId: req.productId.value
    }).lean()
      .then(doc => {
        removeUnnecessaryAttributes(doc);

        res.send(doc);
      })
      .catch(err => {
        res.status(500).send(err);
      });
  }).catch((error) => {
    res.status(500).send(getResponse(500, error.error.err));
  });
}

// DELETE /api/v1/reviews/product/{productId}
module.exports.deleteReviewsByProductId = function deleteReviewsByProductId(req, res, headers, next) {
  AuthResource.auth(headers.authorization).then((body) => {
    ReviewModel.deleteMany({
      reviewedProductId: req.productId.value
    })
      .then(doc => {
        if (doc.deletedCount > 0) {
          return res.status(204).send("Reviews deleted.");
        }

        return res.status(404).send(getResponse(404, "Product id not found."));
      })
      .catch(err => {
        res.status(500).send(err);
      });
  }).catch((error) => {
    res.status(500).send(getResponse(500, error.error.err));
  });
}

// GET /api/v1/review/{id}/comments
module.exports.findReviewCommentsById = function findReviewCommentsById(req, res, headers, next) {
  AuthResource.auth(headers.authorization).then((body) => {
    ReviewModel.findOne({
      id: req.id.value
    }).lean()
      .then(doc => {
        if (doc === null) {
          return res.status(404).send(getResponse(404, "Review not found."));
        }
        removeUnnecessaryAttributes(doc);

        res.send(doc.comments);
      })
      .catch(err => {
        res.status(500).send(err);
      });
  }).catch((error) => {
    res.status(500).send(getResponse(500, error.error.err));
  });
}

// POST /api/v1/review/{id}/comments
module.exports.addCommentToReview = function addCommentToReview(req, res, headers, next) {
  AuthResource.auth(headers.authorization).then((body) => {
    var keys = []
    for (var key in req.comment.value) {
      keys.push(key);
    }

    if (keys.length === 0) {
      return res.status(400).send(getResponse(400, "Request body is missing."));
    }

    var comment = {
      id: uuidv4(),
      clientId: req.comment.value.clientId,
      body: req.comment.value.body,
      date: new Date().toISOString()
    }

    ReviewModel.updateOne(
      { id: req.id.value },
      { $push: { comments: comment } },
      { safe: true, upsert: false }
    ).lean()
      .then(doc => {
        if (doc.n > 0) {
          return res.status(201).send(getResponse(201, "Comment added successfully."));
        }

        return res.status(404).send(getResponse(404, "Review not found."));
      })
      .catch(err => {
        res.status(500).send(err);
      });
  }).catch((error) => {
    res.status(500).send(getResponse(500, error.error.err));
  });
}

// GET /api/v1/review/{reviewId}/comment/{commentId}
module.exports.findReviewSingleComment = function findReviewSingleComment(req, res, headers, next) {
  AuthResource.auth(headers.authorization).then((body) => {
    ReviewModel.findOne({
      id: req.reviewId.value
    }).lean()
      .then(doc => {
        if (doc === null) {
          return res.status(404).send(getResponse(404, "Review not found."));
        }
        removeUnnecessaryAttributes(doc);

        var commentToReturn = {};

        commentToReturn = doc.comments.filter(comment => comment.id === req.commentId.value)[0];

        if (JSON.stringify(commentToReturn) === undefined) {
          return res.status(404).send(getResponse(404, "The comment does not exist in the review."));
        }

        res.send(commentToReturn);
      })
      .catch(err => {
        res.status(500).send(err);
      });
  }).catch((error) => {
    res.status(500).send(getResponse(500, error.error.err));
  });
}

// DELETE /api/v1/review/{reviewId}/comment/{commentId}
module.exports.deleteCommentFromReview = function deleteCommentFromReview(req, res, headers, next) {
  AuthResource.auth(headers.authorization).then((body) => {
    ReviewModel.updateOne(
      { id: req.reviewId.value },
      { $pull: { comments: { id: req.commentId.value } } },
      { safe: true }
    ).lean()
      .then(doc => {
        if (doc.n > 0) {
          return res.status(201).send(getResponse(201, "Comment deleted successfully."));
        }

        return res.status(404).send(getResponse(404, "Comment not found."));
      })
      .catch(err => {
        res.status(500).send(err);
      });
  }).catch((error) => {
    res.status(500).send(getResponse(500, error.error.err));
  });
}

// PUT /api/v1/review/{reviewId}/comment/{commentId}
module.exports.updateCommentFromReview = function updateCommentFromReview(req, res, headers, next) {
  AuthResource.auth(headers.authorization).then((body) => {
    var keys = []
    for (var key in req.comment.value) {
      keys.push(key);
    }

    if (keys.length === 0) {
      return res.status(400).send(getResponse(400, "Request body is missing."));
    }

    ReviewModel.updateOne(
      {
        id: req.reviewId.value,
        "comments.id": req.commentId.value
      },
      {
        $set: {
          "comments.$.body": req.comment.value.body
        }
      },
      { safe: true }
    ).lean()
      .then(doc => {
        if (doc.n > 0) {
          return res.status(201).send(getResponse(201, "Comment updated successfully."));
        }

        return res.status(404).send(getResponse(404, "Comment not found."));
      })
      .catch(err => {
        res.status(500).send(err);
      });
  }).catch((error) => {
    res.status(500).send(getResponse(500, error.error.err));
  });
}

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
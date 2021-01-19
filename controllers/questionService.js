'use strict'

const AuthResource = require('../resources/authResource')
var QuestionModel = require("../models/question.model");
const { v4: uuidv4 } = require('uuid');


// GET /api/v1/questions/
module.exports.getQuestions = async function getQuestions(req, res, headers, next) {
  try {
    // let body = await AuthResource.auth(headers.authorization);
    let doc = await QuestionModel.find().lean();
    removeUnnecessaryAttributes(doc);
    res.send(doc)
  } catch (error) {
    console.log(error);
    res.status(500).send(getResponse(500, error));
  }
  // AuthResource.auth(headers.authorization).then((body) => {
  //   QuestionModel.find({}).lean().then(question => res.status(200).send(question));
  // }).catch((error) => {
  //   res.status(500).send(getResponse(500, error.error.err));
  // });
};

// POST /api/v1/questions/
module.exports.addQuestion = function addQuestion(req, res, headers, next) {
  AuthResource.auth(headers.authorization).then((body) => {
    console.log('Creating question with value:')
    console.log(req.question.value);
    if (!req.question.value) {
      return res.status(400).send(getResponse(400, "Request body is missing"));

    }
    var question = new QuestionModel(req.question.value);
    question.id = uuidv4();
    question.dateCreated = new Date().toISOString();
    console.log(question);

    QuestionModel.create(question)
      .then(doc => {
        if (!doc || doc.length === 0) {
          return res.status(500).send(getResponse(500, "Unexpected error"));
        }

        res.status(201).send(getResponse(201, "Question created successfully"));
      })
      .catch(err => {
        res.status(500).json(getResponse(500, "Unexpected error"));
      })
  }).catch((error) => {
    res.status(500).send(getResponse(500, error.error.err));
  });
}

// GET /api/v1/questions/{id}
module.exports.findQuestionByid = function findQuestionByid(req, res, headers, next) {
  // AuthResource.auth(headers.authorization).then((body) => {
    QuestionModel.findOne({ id: req.id.value }).lean().then(question => res.status(200).send(question));
  // }).catch((error) => {
  //   res.status(500).send(getResponse(500, error.error.err));
  // });
};

// DELETE /api/v1/questions/{id}
module.exports.deleteQuestion = function deleteQuestion(req, res, headers, next) {
  AuthResource.auth(headers.authorization).then((body) => {
    QuestionModel.deleteOne({
      id: req.id.value
    })
      .then(doc => {
        if (doc.deletedCount > 0) {
          return res.status(204).send("Question deleted.");
        }

        return res.status(404).send(getResponse(404, "Question not found."));
      })
      .catch(err => {
        res.status(500).send(err);
      });
  }).catch((error) => {
    res.status(500).send(getResponse(500, error.error.err));
  });
};

// PUT /api/v1/questions/{questionId}
module.exports.updateQuestion = function updateQuestion(req, res, headers, next) {
  AuthResource.auth(headers.authorization).then((body) => {
    var keys = []
    for (var key in req.question.value) {
      keys.push(key);
    }

    if (keys.length === 0) {
      return res.status(400).send(getResponse(400, "Request body is missing."));
    }

    QuestionModel.findOneAndUpdate({
      id: req.id.value
    }, req.question.value, {
      new: true,
      useFindAndModify: false
    }).lean()
      .then(doc => {
        if (doc === null) {
          return res.status(404).send(getResponse(404, "Question not found."));
        }

        return res.status(204).send("Question updated.");
      })
      .catch(err => {
        res.status(500).send(err);
      });
  }).catch((error) => {
    res.status(500).send(getResponse(500, error.error.err));
  });
};

// GET /api/v1/questions/product/{productId}
module.exports.findQuestionsByProductId = function findQuestionsByProductId(req, res, headers, next) {
  // AuthResource.auth(headers.authorization).then((body) => {
    QuestionModel.find({
      productId: req.productId.value
    }).lean()
      .then(doc => {
        removeUnnecessaryAttributes(doc);

        res.send(doc);
      })
      .catch(err => {
        res.status(500).send(err);
      });
  // }).catch((error) => {
  //   res.status(500).send(getResponse(500, error.error.err));
  // });
}

// DELETE /api/v1/questions/product/{productId}
module.exports.deleteQuestionsByProductId = function deleteQuestionsByProductId(req, res, headers, next) {
  AuthResource.auth(headers.authorization).then((body) => {
    QuestionModel.deleteMany({
      productId: req.productId.value
    })
      .then(doc => {
        if (doc.deletedCount > 0) {
          return res.status(204).send("Questions deleted.");
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

// GET /api/v1/question/{id}/replies
module.exports.findQuestionRepliesById = function findQuestionRepliesById(req, res, headers, next) {
  // AuthResource.auth(headers.authorization).then((body) => {
    QuestionModel.findOne({
      id: req.id.value
    }).lean()
      .then(doc => {
        if (doc === null) {
          return res.status(404).send(getResponse(404, "Question not found."));
        }
        removeUnnecessaryAttributes(doc);

        res.send(doc.replies);
      })
      .catch(err => {
        res.status(500).send(err);
      });
  // }).catch((error) => {
  //   res.status(500).send(getResponse(500, error.error.err));
  // });
}

// POST /api/v1/question/{id}/replies
module.exports.addReplyToQuestion = function addReplyToQuestion(req, res, headers, next) {
  AuthResource.auth(headers.authorization).then((body) => {
    var keys = []
    for (var key in req.reply.value) {
      keys.push(key);
    }

    if (keys.length === 0) {
      return res.status(400).send(getResponse(400, "Request body is missing."));
    }

    var reply = {
      id: uuidv4(),
      clientId: req.reply.value.clientId,
      body: req.reply.value.body,
      date: new Date().toISOString()
    }

    QuestionModel.updateOne(
      { id: req.id.value },
      { $push: { replies: reply } },
      { safe: true, upsert: false }
    ).lean()
      .then(doc => {
        if (doc.n > 0) {
          return res.status(201).send(getResponse(201, "Reply added successfully."));
        }

        return res.status(404).send(getResponse(404, "Question not found."));
      })
      .catch(err => {
        res.status(500).send(err);
      });
  }).catch((error) => {
    res.status(500).send(getResponse(500, error.error.err));
  });
}

// GET /api/v1/question/{questionId}/reply/{replyId}
module.exports.findQuestionSingleReply = function findQuestionSingleReply(req, res, headers, next) {
  // AuthResource.auth(headers.authorization).then((body) => {
    QuestionModel.findOne({
      id: req.questionId.value
    }).lean()
      .then(doc => {
        if (doc === null) {
          return res.status(404).send(getResponse(404, "Question not found."));
        }
        removeUnnecessaryAttributes(doc);

        var replyToReturn = {};

        replyToReturn = doc.replies.filter(reply => reply.id === req.replyId.value)[0];

        if (JSON.stringify(replyToReturn) === undefined) {
          return res.status(404).send(getResponse(404, "The reply does not exist in the question."));
        }

        res.send(replyToReturn);
      })
      .catch(err => {
        res.status(500).send(err);
      });
  // }).catch((error) => {
  //   res.status(500).send(getResponse(500, error.error.err));
  // });
}

// DELETE /api/v1/question/{questionId}/reply/{replyId}
module.exports.deleteReplyFromQuestion = function deleteReplyFromQuestion(req, res, headers, next) {
  AuthResource.auth(headers.authorization).then((body) => {
    QuestionModel.updateOne(
      { id: req.questionId.value },
      { $pull: { replies: { id: req.replyId.value } } },
      { safe: true }
    ).lean()
      .then(doc => {
        if (doc.n > 0) {
          return res.status(201).send(getResponse(201, "Reply deleted successfully."));
        }

        return res.status(404).send(getResponse(404, "Reply not found."));
      })
      .catch(err => {
        res.status(500).send(err);
      });
  }).catch((error) => {
    res.status(500).send(getResponse(500, error.error.err));
  });
}

// PUT /api/v1/question/{questionId}/reply/{replyId}
module.exports.updateReplyFromQuestion = function updateReplyFromQuestion(req, res, headers, next) {
  AuthResource.auth(headers.authorization).then((body) => {
    var keys = []
    for (var key in req.reply.value) {
      keys.push(key);
    }

    if (keys.length === 0) {
      return res.status(400).send(getResponse(400, "Request body is missing."));
    }

    QuestionModel.updateOne(
      {
        id: req.questionId.value,
        "replies.id": req.replyId.value
      },
      {
        $set: {
          "replies.$.body": req.reply.value.body
        }
      },
      { safe: true }
    ).lean()
      .then(doc => {
        if (doc.n > 0) {
          return res.status(201).send(getResponse(201, "Reply updated successfully."));
        }

        return res.status(404).send(getResponse(404, "Reply not found."));
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
 * Removes the unnecessary attributes from a list of questions, those attributes are '_id', '__v' and '_id' from the replies
 * 
 * @param {*} questions 
 */
function removeUnnecessaryAttributes(questions) {
  if (Array.isArray(questions)) {
    questions.forEach(function (question) {
      removeUnnecessaryAttributesOnSingleQuestion(question);
    });
  } else {
    removeUnnecessaryAttributesOnSingleQuestion(questions);
  }

}

/**
 * Removes the unnecessary attributes from a single question
 * 
 * @param {*} question 
 */
function removeUnnecessaryAttributesOnSingleQuestion(question) {
  delete question["_id"];
  delete question["__v"];

  if (question.hasOwnProperty("replys")) {
    question.replys.forEach(function (reply) {
      delete reply["_id"];
    });
  }
}
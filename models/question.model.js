var mongoose = require('mongoose')

var QuestionSchema = new mongoose.Schema({
    questionText: String,
    dateCreated: String,
    replies: [
        {
            user: String,
            body: String
           // date: Date
        }
    ],
    clientId: String,
    productId: String,
    id: String
})

module.exports = mongoose.model('Question', QuestionSchema);
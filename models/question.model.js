var mongoose = require('mongoose')

var QuestionSchema = new mongoose.Schema({
    questionText: String,
    dateCreated: String,
    replies: [
        {
            id: String,
            clientId: String,
            body: String,
            date: String
        }
    ],
    clientId: String,
    productId: String,
    id: String
})

module.exports = mongoose.model('Question', QuestionSchema);
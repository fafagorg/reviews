var mongoose = require('mongoose')

var ReviewSchema = new mongoose.Schema({
    title: String,
    score: Number,
    description: String,
    dateCreated: String,
    comments: [
        {
            user: String,
            body: String
           // date: Date
        }
    ],
    reviewerClientId: String,
    reviewedProductId: String,
    reviewedClientId: String,
    id: String
})

module.exports = mongoose.model('Review', ReviewSchema);
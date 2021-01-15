var mongoose = require('mongoose')

var ReviewSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    score: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    description: {
        type: String,
        required: true,
        maxlength: 500
    },
    dateCreated: {
        type: String,
        required: true
    },
    reviewerClientId: {
        type: String,
        required: true
    },
    externalScore: {
        type: String,
        maxlength: 50
    },
    reviewedProductId: String,
    reviewedClientId: String,
    comments: [
        {
            id: String,
            clientId: String,
            body: String,
            date: String
        }
    ],
})

module.exports = mongoose.model('Review', ReviewSchema);
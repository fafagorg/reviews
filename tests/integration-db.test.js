const Review = require('../models/review.model');
const mongoose = require('mongoose');
const db = require('../db');
if (process.env.ENVIRONMENT !== 'production') {
    require('dotenv').config();
  }

describe("Review DB connection", () => {
    beforeAll(() => {
        return db.connect(true);
    });

    beforeEach((done) => {
        Review.deleteMany({}, (err) => {
            done();
        });
    });

    it("Writes a Review in the DB", async (done) => {
        let review = new Review({
            id: "123", title: "Test", score: 2,
            description: "Bad thing", reviewerClientId: "1",
            reviewedProductId: "1", reviewedClientId: "1", dateCreated: "123"
        });

        review.save(async (err, review) => {
            expect(err).toBeNull();
            Review.find({}, (err, reviews) => {
                expect(reviews).toBeArrayOfSize(1);
                done();
            });
            done();
        });
    });

    afterAll((done) => {
        mongoose.connection.db.dropDatabase(() => {
            mongoose.connection.close(done);
        });
    });
}); 
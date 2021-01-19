const app = require('../index.js');
const mongoose = require('mongoose');
const request = require('supertest');
const Review = require('../models/review.model');
const Question = require('../models/question.model');
const AuthResource = require('../resources/authResource');
const nock = require('nock');

const AUTHORIZATION = "Authorization";
const API_PATH = "/api/v1";
const DUMMY_TOKEN = "123";
let scope = null;
let scopeIntegration = null;

afterAll(done => {
    mongoose.connection.close();
    app.server.close();
    nock.cleanAll();
    done();
});

beforeEach(async () => {
    scope = nock((process.env.AUTH_URL || 'http://51.103.75.211/api/v1'))
        .post('/auth/validate')
        .reply(200, {
            "userId": "UserForTests"
        });

    scopeIntegration = nock("https://api.deepai.org/api")
        .post('/sentiment-analysis')
        .reply(200, {
            "id": "c7659eb6-4f04-4135-81a7-6debaccb3517",
            "output": [
                "Neutral"
            ]
        });
});

describe("Reviews API", async () => {
    describe("GET /reviews", () => {

        beforeAll(() => {

            const reviews = [
                {
                    "title": "Test",
                    "score": 2,
                    "description": "Bad thing",
                    "reviewerClientId": "1",
                    "reviewedProductId": "1",
                    "reviewedClientId": "1",
                    "comments": [
                        {
                            "id": "ead85c21-83c3-4c01-a723-331949ab822a",
                            "clientId": "1",
                            "body": "Comment",
                            "date": "2021-01-08T13:51:58.373Z"
                        }
                    ],
                    "id": "ecf4e877-0bba-424c-996a-dfc753b402b6",
                    "dateCreated": "2021-01-08T13:50:51.850Z"
                },
                {
                    "title": "Test 2",
                    "score": 3,
                    "description": "Good thing",
                    "reviewerClientId": "2",
                    "reviewedProductId": "2",
                    "reviewedClientId": "2",
                    "comments": [
                        {
                            "id": "ead85c21-83c3-4c01-a723-331949ab822b",
                            "clientId": "2",
                            "body": "Comment 2",
                            "date": "2021-01-08T14:51:58.373Z"
                        }
                    ],
                    "id": "ecf4e877-0bba-424c-996a-dfc753b402b8",
                    "dateCreated": "2021-01-08T14:50:51.850Z"
                }
            ];

            Review.find = jest.fn().mockImplementation(() => {
                return {
                    lean: jest.fn(() => Promise.resolve(reviews))
                }
            });

        });

        it("Should return all reviews", () => {
            const scope = nock((process.env.AUTH_URL || 'http://51.103.75.211/api/v1'))
                .post('/auth/validate')
                .reply(200, {
                    "userId": "UserForTests"
                });
            return request(app)
                .get(API_PATH.concat("/reviews"))
                .set(AUTHORIZATION, DUMMY_TOKEN)
                .then((response) => {
                    expect(response.status).toBe(200);
                    expect(response.body).toBeArrayOfSize(2);
                });

        });
    });

    describe("POST /reviews", () => {
        it("Should create a new review", () => {
            let review = {
                "title": "Test",
                "score": 2,
                "description": "Bad thing",
                "reviewerClientId": "1",
                "reviewedProductId": "1",
                "reviewedClientId": "1"
            };

            Review.create = jest.fn().mockImplementation(() => {
                return Promise.resolve(review)
            });

            return request(app).post(API_PATH.concat("/reviews"))
                .set(AUTHORIZATION, DUMMY_TOKEN)
                .send(review).then((response) => {
                    expect(response.statusCode).toBe(201);
                    expect(response.text).toEqual(expect.stringContaining("Review created successfully."));
                });
        });

        it("Should return failure if score is minor than 1", () => {
            const badReview = {
                "title": "Test",
                "score": 0,
                "description": "Bad thing",
                "reviewerClientId": "1",
                "reviewedProductId": "1",
                "reviewedClientId": "1"
            };

            Review.create = jest.fn().mockImplementation(() => {
                return Promise.resolve(null)
            });

            return request(app).post(API_PATH.concat("/reviews"))
                .set(AUTHORIZATION, DUMMY_TOKEN)
                .send(badReview)
                .then((response) => {
                    expect(response.statusCode).toBe(500);
                });
        });

    });

    describe("GET /reviews/{id}", () => {

        beforeAll(() => {
            const reviews = [
                {
                    "title": "Test 2",
                    "score": 3,
                    "description": "Good thing",
                    "reviewerClientId": "2",
                    "reviewedProductId": "2",
                    "reviewedClientId": "2",
                    "comments": [
                        {
                            "id": "ead85c21-83c3-4c01-a723-331949ab822b",
                            "clientId": "2",
                            "body": "Comment 2",
                            "date": "2021-01-08T14:51:58.373Z"
                        }
                    ],
                    "id": "ecf4e877-0bba-424c-996a-dfc753b402b8",
                    "dateCreated": "2021-01-08T14:50:51.850Z"
                }
            ];

            Review.findOne = jest.fn().mockImplementation(() => {
                return {
                    lean: jest.fn(() => Promise.resolve(reviews))
                }
            });

        });

        it("Should return the review with the given id", () => {
            return request(app)
                .get(API_PATH.concat("/reviews/ecf4e877-0bba-424c-996a-dfc753b402b8"))
                .set(AUTHORIZATION, DUMMY_TOKEN)
                .then((response) => {
                    expect(response.status).toBe(200);
                    expect(response.body).toBeArrayOfSize(1);
                });
        });

        it("Should return 404 because there is no reviews with the given id", () => {
            Review.findOne = jest.fn().mockImplementation(() => {
                return {
                    lean: jest.fn(() => Promise.resolve(null))
                }
            });

            return request(app)
                .get(API_PATH.concat("/reviews/34"))
                .set(AUTHORIZATION, DUMMY_TOKEN)
                .then((response) => {
                    expect(response.status).toBe(404);
                });
        });

    });

    describe("DELETE /reviews/{id}", () => {
        beforeAll(() => {
            const reviews = [
                {
                    "title": "Test 2",
                    "score": 3,
                    "description": "Good thing",
                    "reviewerClientId": "2",
                    "reviewedProductId": "2",
                    "reviewedClientId": "2",
                    "comments": [
                        {
                            "id": "ead85c21-83c3-4c01-a723-331949ab822b",
                            "clientId": "2",
                            "body": "Comment 2",
                            "date": "2021-01-08T14:51:58.373Z"
                        }
                    ],
                    "id": "ecf4e877-0bba-424c-996a-dfc753b402b8",
                    "dateCreated": "2021-01-08T14:50:51.850Z"
                }
            ];
        });

        it("Should delete the review with the given id and return 204", () => {
            Review.deleteOne = jest.fn().mockImplementation(() => {
                return Promise.resolve({ deletedCount: 1 })
            });

            return request(app)
                .delete(API_PATH.concat("/reviews/ecf4e877-0bba-424c-996a-dfc753b402b8"))
                .set(AUTHORIZATION, DUMMY_TOKEN)
                .then((response) => {
                    expect(response.status).toBe(204);
                });
        });

        it("Should return 404 since the review with the given id does not exist", () => {
            Review.deleteOne = jest.fn().mockImplementation(() => {
                return Promise.resolve({ deletedCount: 0 })
            });

            return request(app)
                .delete(API_PATH.concat("/reviews/34"))
                .set(AUTHORIZATION, DUMMY_TOKEN)
                .then((response) => {
                    expect(response.status).toBe(404);
                });
        });
    });

    describe("PUT /reviews/{id}", () => {
        beforeEach(() => {
            const review = {};
        });

        it("Should edit the review with the given id and return 204", () => {
            review = {
                "title": "Test updated 2",
                "score": 2,
                "description": "Bad thing updated",
                "reviewerClientId": "1",
                "reviewedProductId": "1",
                "reviewedClientId": "1",
                "comments": [
                    {
                        "reviewerClientId": "1",
                        "body": "comment1",
                        "date": "2020-12-12 00:00:00"
                    }
                ]
            };

            Review.findOneAndUpdate = jest.fn().mockImplementation(() => {
                return {
                    lean: jest.fn(() => Promise.resolve({ updatedCount: 1 }))
                }
            });

            return request(app)
                .put(API_PATH.concat("/reviews/ecf4e877-0bba-424c-996a-dfc753b402b8"))
                .send(review)
                .set(AUTHORIZATION, DUMMY_TOKEN)
                .then((response) => {
                    expect(response.statusCode).toBe(204);
                });
        });

        it("Should return 404 since there is no review with the given id", () => {
            Review.findOneAndUpdate = jest.fn().mockImplementation(() => {
                return {
                    lean: jest.fn(() => Promise.resolve(null))
                }
            });

            return request(app)
                .put(API_PATH.concat("/reviews/34"))
                .send(review)
                .set(AUTHORIZATION, DUMMY_TOKEN)
                .then((response) => {
                    expect(response.statusCode).toBe(404);
                });
        });
    });

    describe("GET /reviews/client/{clientId}", () => {
        let reviews = [];
        beforeEach(() => {
            reviews = [
                {
                    "title": "Test 2",
                    "score": 3,
                    "description": "Good thing",
                    "reviewerClientId": "2",
                    "reviewedProductId": "2",
                    "reviewedClientId": "2",
                    "comments": [
                        {
                            "id": "ead85c21-83c3-4c01-a723-331949ab822b",
                            "clientId": "2",
                            "body": "Comment 2",
                            "date": "2021-01-08T14:51:58.373Z"
                        }
                    ],
                    "id": "ecf4e877-0bba-424c-996a-dfc753b402b8",
                    "dateCreated": "2021-01-08T14:50:51.850Z"
                },
                {
                    "title": "Test 3",
                    "score": 1,
                    "description": "Bad thing",
                    "reviewerClientId": "2",
                    "reviewedProductId": "2",
                    "reviewedClientId": "2",
                    "comments": [
                        {
                            "id": "ead85c21-83c3-4c01-a723-331969ac822b",
                            "clientId": "2",
                            "body": "Comment 1",
                            "date": "2021-01-08T18:51:58.373Z"
                        }
                    ],
                    "id": "abc4e877-0bba-424c-996a-dfc753b402b9",
                    "dateCreated": "2021-01-10T14:50:51.850Z"
                }
            ];
        });


        it("Should return the reviews of the client with the given id", () => {
            Review.find = jest.fn().mockImplementation(() => {
                return {
                    lean: jest.fn(() => Promise.resolve(reviews))
                }
            });

            return request(app)
                .get(API_PATH.concat("/reviews/client/2"))
                .set(AUTHORIZATION, DUMMY_TOKEN)
                .then((response) => {
                    expect(response.status).toBe(200);
                    expect(response.body).toBeArrayOfSize(2);
                });
        });

        it("Should return an empty list because the client with the given id does not have any review", () => {
            reviews.length = 0;
            Review.find = jest.fn().mockImplementation(() => {
                return {
                    lean: jest.fn(() => Promise.resolve(reviews))
                }
            });

            return request(app)
                .get(API_PATH.concat("/reviews/client/34"))
                .set(AUTHORIZATION, DUMMY_TOKEN)
                .then((response) => {
                    expect(response.status).toBe(200);
                    expect(response.body.length).toBe(0);
                });
        });

    });

    describe("DELETE /reviews/client/{clientId}", () => {
        beforeAll(() => {
            let reviews = [
                {
                    "title": "Test 2",
                    "score": 3,
                    "description": "Good thing",
                    "reviewerClientId": "2",
                    "reviewedProductId": "2",
                    "reviewedClientId": "2",
                    "comments": [
                        {
                            "id": "ead85c21-83c3-4c01-a723-331949ab822b",
                            "clientId": "2",
                            "body": "Comment 2",
                            "date": "2021-01-08T14:51:58.373Z"
                        }
                    ],
                    "id": "ecf4e877-0bba-424c-996a-dfc753b402b8",
                    "dateCreated": "2021-01-08T14:50:51.850Z"
                },
                {
                    "title": "Test 3",
                    "score": 1,
                    "description": "Bad thing",
                    "reviewerClientId": "2",
                    "reviewedProductId": "2",
                    "reviewedClientId": "2",
                    "comments": [
                        {
                            "id": "ead85c21-83c3-4c01-a723-331969ac822b",
                            "clientId": "2",
                            "body": "Comment 1",
                            "date": "2021-01-08T18:51:58.373Z"
                        }
                    ],
                    "id": "abc4e877-0bba-424c-996a-dfc753b402b9",
                    "dateCreated": "2021-01-10T14:50:51.850Z"
                }
            ];
        });

        it("Should delete all the reviews of the client with the given id and return 204", () => {
            Review.deleteMany = jest.fn().mockImplementation(() => {
                return Promise.resolve({ deletedCount: 2 })
            });

            return request(app)
                .delete(API_PATH.concat("/reviews/client/2"))
                .set(AUTHORIZATION, DUMMY_TOKEN)
                .then((response) => {
                    expect(response.status).toBe(204);
                });
        });

        it("Should return 404 since the given client id does not exist", () => {
            Review.deleteMany = jest.fn().mockImplementation(() => {
                return Promise.resolve({ deletedCount: 0 })
            });

            return request(app)
                .delete(API_PATH.concat("/reviews/client/34"))
                .set(AUTHORIZATION, DUMMY_TOKEN)
                .then((response) => {
                    expect(response.status).toBe(404);
                });
        });
    });

    describe("GET /reviews/product/{productId}", () => {
        let reviews = [];
        beforeEach(() => {
            reviews = [
                {
                    "title": "Test 2",
                    "score": 3,
                    "description": "Good thing",
                    "reviewerClientId": "2",
                    "reviewedProductId": "2",
                    "reviewedClientId": "2",
                    "comments": [
                        {
                            "id": "ead85c21-83c3-4c01-a723-331949ab822b",
                            "clientId": "2",
                            "body": "Comment 2",
                            "date": "2021-01-08T14:51:58.373Z"
                        }
                    ],
                    "id": "ecf4e877-0bba-424c-996a-dfc753b402b8",
                    "dateCreated": "2021-01-08T14:50:51.850Z"
                },
                {
                    "title": "Test 3",
                    "score": 1,
                    "description": "Bad thing",
                    "reviewerClientId": "2",
                    "reviewedProductId": "2",
                    "reviewedClientId": "2",
                    "comments": [
                        {
                            "id": "ead85c21-83c3-4c01-a723-331969ac822b",
                            "clientId": "2",
                            "body": "Comment 1",
                            "date": "2021-01-08T18:51:58.373Z"
                        }
                    ],
                    "id": "abc4e877-0bba-424c-996a-dfc753b402b9",
                    "dateCreated": "2021-01-10T14:50:51.850Z"
                }
            ];
        });


        it("Should return the reviews of the product with the given id", () => {
            Review.find = jest.fn().mockImplementation(() => {
                return {
                    lean: jest.fn(() => Promise.resolve(reviews))
                }
            });

            return request(app)
                .get(API_PATH.concat("/reviews/product/2"))
                .set(AUTHORIZATION, DUMMY_TOKEN)
                .then((response) => {
                    expect(response.status).toBe(200);
                    expect(response.body).toBeArrayOfSize(2);
                });
        });

        it("Should return an empty list because the product with the given id does not have any review", () => {
            reviews.length = 0;
            Review.find = jest.fn().mockImplementation(() => {
                return {
                    lean: jest.fn(() => Promise.resolve(reviews))
                }
            });

            return request(app)
                .get(API_PATH.concat("/reviews/product/34"))
                .set(AUTHORIZATION, DUMMY_TOKEN)
                .then((response) => {
                    expect(response.status).toBe(200);
                    expect(response.body.length).toBe(0);
                });
        });

    });

    describe("DELETE /reviews/product/{productId}", () => {
        beforeAll(() => {
            let reviews = [
                {
                    "title": "Test 2",
                    "score": 3,
                    "description": "Good thing",
                    "reviewerClientId": "2",
                    "reviewedProductId": "2",
                    "reviewedClientId": "2",
                    "comments": [
                        {
                            "id": "ead85c21-83c3-4c01-a723-331949ab822b",
                            "clientId": "2",
                            "body": "Comment 2",
                            "date": "2021-01-08T14:51:58.373Z"
                        }
                    ],
                    "id": "ecf4e877-0bba-424c-996a-dfc753b402b8",
                    "dateCreated": "2021-01-08T14:50:51.850Z"
                },
                {
                    "title": "Test 3",
                    "score": 1,
                    "description": "Bad thing",
                    "reviewerClientId": "2",
                    "reviewedProductId": "2",
                    "reviewedClientId": "2",
                    "comments": [
                        {
                            "id": "ead85c21-83c3-4c01-a723-331969ac822b",
                            "clientId": "2",
                            "body": "Comment 1",
                            "date": "2021-01-08T18:51:58.373Z"
                        }
                    ],
                    "id": "abc4e877-0bba-424c-996a-dfc753b402b9",
                    "dateCreated": "2021-01-10T14:50:51.850Z"
                }
            ];
        });

        it("Should delete all the reviews of the product with the given id and return 204", () => {
            Review.deleteMany = jest.fn().mockImplementation(() => {
                return Promise.resolve({ deletedCount: 2 })
            });

            return request(app)
                .delete(API_PATH.concat("/reviews/product/2"))
                .set(AUTHORIZATION, DUMMY_TOKEN)
                .then((response) => {
                    expect(response.status).toBe(204);
                });
        });

        it("Should return 404 since the given product id does not exist", () => {
            Review.deleteMany = jest.fn().mockImplementation(() => {
                return Promise.resolve({ deletedCount: 0 })
            });

            return request(app)
                .delete(API_PATH.concat("/reviews/product/34"))
                .set(AUTHORIZATION, DUMMY_TOKEN)
                .then((response) => {
                    expect(response.status).toBe(404);
                });
        });
    });

    describe("GET /review/{id}/comments", () => {
        let review = [];
        beforeEach(() => {
            review = {
                "title": "Test 2",
                "score": 3,
                "description": "Good thing",
                "reviewerClientId": "2",
                "reviewedProductId": "2",
                "reviewedClientId": "2",
                "comments": [
                    {
                        "id": "ead85c21-83c3-4c01-a723-331949ab822b",
                        "clientId": "2",
                        "body": "Comment 2",
                        "date": "2021-01-08T14:51:58.373Z"
                    },
                    {
                        "id": "12345c21-83c3-4c01-a723-331949ab8123",
                        "clientId": "2",
                        "body": "Good stuff",
                        "date": "2021-01-012T16:51:58.373Z"
                    }
                ],
                "id": "ecf4e877-0bba-424c-996a-dfc753b402b8",
                "dateCreated": "2021-01-08T14:50:51.850Z"
            };
        });


        it("Should return the comments of the review with the given id", () => {
            Review.findOne = jest.fn().mockImplementation(() => {
                return {
                    lean: jest.fn(() => Promise.resolve(review))
                }
            });

            return request(app)
                .get(API_PATH.concat("/review/ecf4e877-0bba-424c-996a-dfc753b402b8/comments"))
                .set(AUTHORIZATION, DUMMY_TOKEN)
                .then((response) => {
                    expect(response.status).toBe(200);
                    expect(response.body).toBeArrayOfSize(2);
                });
        });

        it("Should return 404 because there is no review with the given id", () => {
            Review.findOne = jest.fn().mockImplementation(() => {
                return {
                    lean: jest.fn(() => Promise.resolve(null))
                }
            });

            return request(app)
                .get(API_PATH.concat("/review/34/comments"))
                .set(AUTHORIZATION, DUMMY_TOKEN)
                .then((response) => {
                    expect(response.status).toBe(404);
                });
        });

    });

    describe("POST /review/{id}/comments", () => {
        it("Should create a new comment for the given review", () => {
            let comment = {
                "clientId": "1",
                "body": "Be careful buddy"
            };

            Review.updateOne = jest.fn().mockImplementation(() => {
                return {
                    lean: jest.fn(() => Promise.resolve({ n: 1 }))
                }
            });

            return request(app).post(API_PATH.concat("/review/ecf4e877-0bba-424c-996a-dfc753b402b8/comments"))
                .set(AUTHORIZATION, DUMMY_TOKEN)
                .send(comment).then((response) => {
                    expect(response.statusCode).toBe(201);
                    expect(response.text).toEqual(expect.stringContaining("Comment added successfully."));
                });
        });

        it("Should return 404 since there is no review with the given id", () => {
            let comment = {
                "clientId": "1",
                "body": "Be careful buddy"
            };

            Review.updateOne = jest.fn().mockImplementation(() => {
                return {
                    lean: jest.fn(() => Promise.resolve({ n: 0 }))
                }
            });

            return request(app).post(API_PATH.concat("/review/34/comments"))
                .set(AUTHORIZATION, DUMMY_TOKEN)
                .send(comment)
                .then((response) => {
                    expect(response.statusCode).toBe(404);
                });
        });

    });

    describe("GET /review/{reviewId}/comment/{commentId}", () => {
        let review = [];
        beforeEach(() => {
            review = {
                "title": "Test 2",
                "score": 3,
                "description": "Good thing",
                "reviewerClientId": "2",
                "reviewedProductId": "2",
                "reviewedClientId": "2",
                "comments": [
                    {
                        "id": "ead85c21-83c3-4c01-a723-331949ab822b",
                        "clientId": "2",
                        "body": "Comment 2",
                        "date": "2021-01-08T14:51:58.373Z"
                    },
                    {
                        "id": "12345c21-83c3-4c01-a723-331949ab8123",
                        "clientId": "2",
                        "body": "Good stuff",
                        "date": "2021-01-012T16:51:58.373Z"
                    }
                ],
                "id": "ecf4e877-0bba-424c-996a-dfc753b402b8",
                "dateCreated": "2021-01-08T14:50:51.850Z"
            };
        });


        it("Should return the comment with the given id of the review with the given id", () => {
            Review.findOne = jest.fn().mockImplementation(() => {
                return {
                    lean: jest.fn(() => Promise.resolve(review))
                }
            });

            return request(app)
                .get(API_PATH.concat("/review/ecf4e877-0bba-424c-996a-dfc753b402b8/comment/ead85c21-83c3-4c01-a723-331949ab822b"))
                .set(AUTHORIZATION, DUMMY_TOKEN)
                .then((response) => {
                    expect(response.status).toBe(200);
                });
        });

        it("Should return 404 because there is no review with the given id", () => {
            Review.findOne = jest.fn().mockImplementation(() => {
                return {
                    lean: jest.fn(() => Promise.resolve(null))
                }
            });

            return request(app)
                .get(API_PATH.concat("/review/34/comment/ead85c21-83c3-4c01-a723-331949ab822b"))
                .set(AUTHORIZATION, DUMMY_TOKEN)
                .then((response) => {
                    expect(response.status).toBe(404);
                });
        });

    });

    describe("DELETE /review/{reviewId}/comment/{commentId}", () => {
        beforeAll(() => {
            let reviews = {
                "title": "Test 2",
                "score": 3,
                "description": "Good thing",
                "reviewerClientId": "2",
                "reviewedProductId": "2",
                "reviewedClientId": "2",
                "comments": [
                    {
                        "id": "ead85c21-83c3-4c01-a723-331949ab822b",
                        "clientId": "2",
                        "body": "Comment 2",
                        "date": "2021-01-08T14:51:58.373Z"
                    }
                ],
                "id": "ecf4e877-0bba-424c-996a-dfc753b402b8",
                "dateCreated": "2021-01-08T14:50:51.850Z"
            };
        });

        it("Should delete the comment with the given id from the review with the given id", () => {
            Review.updateOne = jest.fn().mockImplementation(() => {
                return {
                    lean: jest.fn(() => Promise.resolve({ n: 1 }))
                }
            });

            return request(app)
                .delete(API_PATH.concat("/review/ecf4e877-0bba-424c-996a-dfc753b402b8/comment/ead85c21-83c3-4c01-a723-331949ab822b"))
                .set(AUTHORIZATION, DUMMY_TOKEN)
                .then((response) => {
                    expect(response.status).toBe(201);
                });
        });

        it("Should return 404 since the given comment id does not exist", () => {
            Review.updateOne = jest.fn().mockImplementation(() => {
                return {
                    lean: jest.fn(() => Promise.resolve({ n: 0 }))
                }
            });

            return request(app)
                .delete(API_PATH.concat("/review/ecf4e877-0bba-424c-996a-dfc753b402b8/comment/34"))
                .set(AUTHORIZATION, DUMMY_TOKEN)
                .then((response) => {
                    expect(response.status).toBe(404);
                });
        });
    });

    describe("PUT /review/{reviewId}/comment/{commentId}", () => {
        beforeEach(() => {
            let comment = {};
        });

        it("Should edit the comment with the given id from the review from the given id and return 201", () => {
            comment = {
                "clientId": "1",
                "body": "Test updated first comment"
            };

            Review.updateOne = jest.fn().mockImplementation(() => {
                return {
                    lean: jest.fn(() => Promise.resolve({ n: 1 }))
                }
            });

            return request(app)
                .put(API_PATH.concat("/review/ecf4e877-0bba-424c-996a-dfc753b402b8/comment/ead85c21-83c3-4c01-a723-331949ab822b"))
                .send(comment)
                .set(AUTHORIZATION, DUMMY_TOKEN)
                .then((response) => {
                    expect(response.statusCode).toBe(201);
                });
        });

        it("Should return 404 since there is no comment with the given id", () => {
            Review.updateOne = jest.fn().mockImplementation(() => {
                return {
                    lean: jest.fn(() => Promise.resolve({ n: 0 }))
                }
            });

            return request(app)
                .put(API_PATH.concat("/review/ecf4e877-0bba-424c-996a-dfc753b402b8/comment/34"))
                .send(comment)
                .set(AUTHORIZATION, DUMMY_TOKEN)
                .then((response) => {
                    expect(response.statusCode).toBe(404);
                });
        });
    });
});

describe("Questions API", async () => {
    describe("GET /questions", () => {

        beforeAll(() => {
            const questions = [
                {
                    "id": "6253511f-0234-4eb2-ba8d-7c8fe04a9951",
                    "productId": "1",
                    "clientId": "1",
                    "questionText": "How is this?",
                    "dateCreated": "2021-01-08T14:50:51.850Z",
                    "replies": [
                        {
                            "clientId": "2",
                            "body": "Good",
                            "date": "2021-01-12T14:50:51.850Z"
                        }
                    ]
                },
                {
                    "id": "1233511f-0234-4eb2-ba8d-7c8fe04a9123",
                    "productId": "2",
                    "clientId": "2",
                    "questionText": "Looks great?",
                    "dateCreated": "2021-01-09T14:50:51.850Z",
                    "replies": [
                        {
                            "clientId": "1",
                            "body": "Nope",
                            "date": "2021-01-14T14:50:51.850Z"
                        }
                    ]
                }
            ];

            Question.find = jest.fn().mockImplementation(() => {
                return {
                    lean: jest.fn(() => Promise.resolve(questions))
                }
            });

        });

        it("Should return all questions", () => {
            return request(app)
                .get(API_PATH.concat("/questions"))
                .set(AUTHORIZATION, DUMMY_TOKEN)
                .then((response) => {
                    expect(response.status).toBe(200);
                    expect(response.body).toBeArrayOfSize(2);
                });

        });
    });

    describe("POST /questions", () => {
        it("Should create a new question", () => {
            let question = {
                "productId": "1",
                "clientId": "1",
                "questionText": "Is it good?",
                "dateCreated": "2021-01-09T14:50:51.850Z",
                "replies": []
            };

            Question.create = jest.fn().mockImplementation(() => {
                return Promise.resolve(question)
            });

            return request(app).post(API_PATH.concat("/questions"))
                .set(AUTHORIZATION, DUMMY_TOKEN)
                .send(question).then((response) => {
                    expect(response.statusCode).toBe(201);
                    expect(response.text).toEqual(expect.stringContaining("Question created successfully"));
                });
        });

        it("Should return failure if there is no question text", () => {
            let badQuestion = {
                "productId": "1",
                "clientId": "1",
                "dateCreated": "2021-01-09T14:50:51.850Z",
                "replies": []
            };

            Question.create = jest.fn().mockImplementation(() => {
                return Promise.resolve(null)
            });

            return request(app).post(API_PATH.concat("/questions"))
                .set(AUTHORIZATION, DUMMY_TOKEN)
                .send(badQuestion)
                .then((response) => {
                    expect(response.statusCode).toBe(500);
                });
        });
    });

    describe("GET /questions/{questionId}", () => {
        beforeAll(() => {
            const questions = [
                {
                    "id": "6253511f-0234-4eb2-ba8d-7c8fe04a9951",
                    "productId": "1",
                    "clientId": "1",
                    "questionText": "How is this?",
                    "dateCreated": "2021-01-08T14:50:51.850Z",
                    "replies": [
                        {
                            "clientId": "2",
                            "body": "Good",
                            "date": "2021-01-12T14:50:51.850Z"
                        }
                    ]
                }
            ];

            Question.findOne = jest.fn().mockImplementation(() => {
                return {
                    lean: jest.fn(() => Promise.resolve(questions))
                }
            });

        });

        it("Should return the question with the given id", () => {
            return request(app)
                .get(API_PATH.concat("/questions/6253511f-0234-4eb2-ba8d-7c8fe04a9951"))
                .set(AUTHORIZATION, DUMMY_TOKEN)
                .then((response) => {
                    expect(response.status).toBe(200);
                    expect(response.body).toBeArrayOfSize(1);
                });
        });

        it("Should return an empty list because there is no reviews with the given id", () => {
            Question.findOne = jest.fn().mockImplementation(() => {
                return {
                    lean: jest.fn(() => Promise.resolve([]))
                }
            });

            return request(app)
                .get(API_PATH.concat("/questions/34"))
                .set(AUTHORIZATION, DUMMY_TOKEN)
                .then((response) => {
                    expect(response.status).toBe(200);
                    expect(response.body.length).toBe(0);
                });
        });
    });

    describe("DELETE /questions/{id}", () => {
        beforeAll(() => {
            const questions = [
                {
                    "id": "6253511f-0234-4eb2-ba8d-7c8fe04a9951",
                    "productId": "1",
                    "clientId": "1",
                    "questionText": "How is this?",
                    "dateCreated": "2021-01-08T14:50:51.850Z",
                    "replies": [
                        {
                            "clientId": "2",
                            "body": "Good",
                            "date": "2021-01-12T14:50:51.850Z"
                        }
                    ]
                }
            ];
        });

        it("Should delete the question with the given id and return 204", () => {
            Question.deleteOne = jest.fn().mockImplementation(() => {
                return Promise.resolve({ deletedCount: 1 })
            });

            return request(app)
                .delete(API_PATH.concat("/questions/6253511f-0234-4eb2-ba8d-7c8fe04a9951"))
                .set(AUTHORIZATION, DUMMY_TOKEN)
                .then((response) => {
                    expect(response.status).toBe(204);
                });
        });

        it("Should return 404 since the question with the given id does not exist", () => {
            Question.deleteOne = jest.fn().mockImplementation(() => {
                return Promise.resolve({ deletedCount: 0 })
            });

            return request(app)
                .delete(API_PATH.concat("/questions/34"))
                .set(AUTHORIZATION, DUMMY_TOKEN)
                .then((response) => {
                    expect(response.status).toBe(404);
                });
        });
    });

    describe("PUT /questions/{id}", () => {
        beforeEach(() => {
            const question = {};
        });

        it("Should edit the question with the given id and return 204", () => {
            question = {
                "id": "6253511f-0234-4eb2-ba8d-7c8fe04a9951",
                "productId": "1",
                "clientId": "1",
                "questionText": "How is this?",
                "dateCreated": "2021-01-08T14:50:51.850Z",
                "replies": [
                    {
                        "clientId": "2",
                        "body": "Good",
                        "date": "2021-01-12T14:50:51.850Z"
                    }
                ]
            };

            Question.findOneAndUpdate = jest.fn().mockImplementation(() => {
                return {
                    lean: jest.fn(() => Promise.resolve({ updatedCount: 1 }))
                }
            });

            return request(app)
                .put(API_PATH.concat("/questions/6253511f-0234-4eb2-ba8d-7c8fe04a9951"))
                .send(question)
                .set(AUTHORIZATION, DUMMY_TOKEN)
                .then((response) => {
                    expect(response.statusCode).toBe(204);
                });
        });

        it("Should return 404 since there is no question with the given id", () => {
            Question.findOneAndUpdate = jest.fn().mockImplementation(() => {
                return {
                    lean: jest.fn(() => Promise.resolve(null))
                }
            });

            return request(app)
                .put(API_PATH.concat("/questions/34"))
                .send(question)
                .set(AUTHORIZATION, DUMMY_TOKEN)
                .then((response) => {
                    expect(response.statusCode).toBe(404);
                });
        });
    });

    describe("GET /questions/product/{productId}", () => {
        let questions = [];
        beforeEach(() => {
            questions = [
                {
                    "id": "6253511f-0234-4eb2-ba8d-7c8fe04a9951",
                    "productId": "1",
                    "clientId": "1",
                    "questionText": "How is this?",
                    "dateCreated": "2021-01-08T14:50:51.850Z",
                    "replies": [
                        {
                            "clientId": "2",
                            "body": "Good",
                            "date": "2021-01-12T14:50:51.850Z"
                        }
                    ]
                },
                {
                    "id": "1233511f-0234-4eb2-ba8d-7c8fe04a9123",
                    "productId": "1",
                    "clientId": "2",
                    "questionText": "Looks great?",
                    "dateCreated": "2021-01-09T14:50:51.850Z",
                    "replies": [
                        {
                            "clientId": "1",
                            "body": "Nope",
                            "date": "2021-01-14T14:50:51.850Z"
                        }
                    ]
                }
            ];
        });


        it("Should return the questions of the product with the given id", () => {
            Question.find = jest.fn().mockImplementation(() => {
                return {
                    lean: jest.fn(() => Promise.resolve(questions))
                }
            });

            return request(app)
                .get(API_PATH.concat("/questions/product/1"))
                .set(AUTHORIZATION, DUMMY_TOKEN)
                .then((response) => {
                    expect(response.status).toBe(200);
                    expect(response.body).toBeArrayOfSize(2);
                });
        });

        it("Should return an empty list because the product with the given id does not have any question", () => {
            questions.length = 0;
            Question.find = jest.fn().mockImplementation(() => {
                return {
                    lean: jest.fn(() => Promise.resolve(questions))
                }
            });

            return request(app)
                .get(API_PATH.concat("/questions/product/34"))
                .set(AUTHORIZATION, DUMMY_TOKEN)
                .then((response) => {
                    expect(response.status).toBe(200);
                    expect(response.body.length).toBe(0);
                });
        });
    });

    describe("DELETE /questions/product/{productId}", () => {
        beforeAll(() => {
            let questions = [
                {
                    "id": "6253511f-0234-4eb2-ba8d-7c8fe04a9951",
                    "productId": "1",
                    "clientId": "1",
                    "questionText": "How is this?",
                    "dateCreated": "2021-01-08T14:50:51.850Z",
                    "replies": [
                        {
                            "clientId": "2",
                            "body": "Good",
                            "date": "2021-01-12T14:50:51.850Z"
                        }
                    ]
                },
                {
                    "id": "1233511f-0234-4eb2-ba8d-7c8fe04a9123",
                    "productId": "1",
                    "clientId": "2",
                    "questionText": "Looks great?",
                    "dateCreated": "2021-01-09T14:50:51.850Z",
                    "replies": [
                        {
                            "clientId": "1",
                            "body": "Nope",
                            "date": "2021-01-14T14:50:51.850Z"
                        }
                    ]
                }
            ];
        });

        it("Should delete all the questions of the product with the given id and return 204", () => {
            Question.deleteMany = jest.fn().mockImplementation(() => {
                return Promise.resolve({ deletedCount: 2 })
            });

            return request(app)
                .delete(API_PATH.concat("/questions/product/1"))
                .set(AUTHORIZATION, DUMMY_TOKEN)
                .then((response) => {
                    expect(response.status).toBe(204);
                });
        });

        it("Should return 404 since the given product id does not exist", () => {
            Question.deleteMany = jest.fn().mockImplementation(() => {
                return Promise.resolve({ deletedCount: 0 })
            });

            return request(app)
                .delete(API_PATH.concat("/reviews/product/34"))
                .set(AUTHORIZATION, DUMMY_TOKEN)
                .then((response) => {
                    expect(response.status).toBe(404);
                });
        });
    });

    describe("GET /question/{id}/replies", () => {
        let question = [];
        beforeEach(() => {
            question = {
                "id": "6253511f-0234-4eb2-ba8d-7c8fe04a9951",
                "productId": "1",
                "clientId": "1",
                "questionText": "How is this?",
                "dateCreated": "2021-01-08T14:50:51.850Z",
                "replies": [
                    {
                        "clientId": "2",
                        "body": "Good",
                        "date": "2021-01-12T14:50:51.850Z"
                    },
                    {
                        "clientId": "3",
                        "body": "Not that good",
                        "date": "2021-01-15T14:50:51.850Z"
                    }
                ]
            };
        });


        it("Should return the replies of the question with the given id", () => {
            Question.findOne = jest.fn().mockImplementation(() => {
                return {
                    lean: jest.fn(() => Promise.resolve(question))
                }
            });

            return request(app)
                .get(API_PATH.concat("/question/6253511f-0234-4eb2-ba8d-7c8fe04a9951/replies"))
                .set(AUTHORIZATION, DUMMY_TOKEN)
                .then((response) => {
                    expect(response.status).toBe(200);
                    expect(response.body).toBeArrayOfSize(2);
                });
        });

        it("Should return 404 because there is no question with the given id", () => {
            Question.findOne = jest.fn().mockImplementation(() => {
                return {
                    lean: jest.fn(() => Promise.resolve(null))
                }
            });

            return request(app)
                .get(API_PATH.concat("/question/34/replies"))
                .set(AUTHORIZATION, DUMMY_TOKEN)
                .then((response) => {
                    expect(response.status).toBe(404);
                });
        });
    });

    describe("POST /question/{id}/replies", () => {
        it("Should create a new reply for the given question", () => {
            let reply = {
                "clientId": "1",
                "body": "Yes"
            };

            Question.updateOne = jest.fn().mockImplementation(() => {
                return {
                    lean: jest.fn(() => Promise.resolve({ n: 1 }))
                }
            });

            return request(app).post(API_PATH.concat("/question/ecf4e877-0bba-424c-996a-dfc753b402b8/replies"))
                .set(AUTHORIZATION, DUMMY_TOKEN)
                .send(reply).then((response) => {
                    expect(response.statusCode).toBe(201);
                    expect(response.text).toEqual(expect.stringContaining("Reply added successfully."));
                });
        });

        it("Should return 404 since there is no question with the given id", () => {
            let reply = {
                "clientId": "1",
                "body": "Be careful buddy"
            };

            Question.updateOne = jest.fn().mockImplementation(() => {
                return {
                    lean: jest.fn(() => Promise.resolve({ n: 0 }))
                }
            });

            return request(app).post(API_PATH.concat("/question/34/replies"))
                .set(AUTHORIZATION, DUMMY_TOKEN)
                .send(reply)
                .then((response) => {
                    expect(response.statusCode).toBe(404);
                });
        });

    });

    describe("GET /question/{questionId}/reply/{replyId}", () => {
        let question = [];
        beforeEach(() => {
            question = {
                "id": "6253511f-0234-4eb2-ba8d-7c8fe04a9951",
                "productId": "1",
                "clientId": "1",
                "questionText": "How is this?",
                "dateCreated": "2021-01-08T14:50:51.850Z",
                "replies": [
                    {
                        "id": "4321511f-1234-4eb2-ba8d-7c8fe04a9951",
                        "clientId": "2",
                        "body": "Good",
                        "date": "2021-01-12T14:50:51.850Z"
                    },
                    {
                        "id": "1231511f-1234-4eb2-ba8d-7c8fe04a9123",
                        "clientId": "3",
                        "body": "Not that good",
                        "date": "2021-01-15T14:50:51.850Z"
                    }
                ]
            };
        });


        it("Should return the reply with the given id of the question with the given id", () => {
            Question.findOne = jest.fn().mockImplementation(() => {
                return {
                    lean: jest.fn(() => Promise.resolve(question))
                }
            });

            return request(app)
                .get(API_PATH.concat("/question/6253511f-0234-4eb2-ba8d-7c8fe04a9951/reply/4321511f-1234-4eb2-ba8d-7c8fe04a9951"))
                .set(AUTHORIZATION, DUMMY_TOKEN)
                .then((response) => {
                    expect(response.status).toBe(200);
                });
        });

        it("Should return 404 because there is no question with the given id", () => {
            Question.findOne = jest.fn().mockImplementation(() => {
                return {
                    lean: jest.fn(() => Promise.resolve(null))
                }
            });

            return request(app)
                .get(API_PATH.concat("/question/34/reply/4321511f-1234-4eb2-ba8d-7c8fe04a9951"))
                .set(AUTHORIZATION, DUMMY_TOKEN)
                .then((response) => {
                    expect(response.status).toBe(404);
                });
        });
    });

    describe("DELETE /question/{questionId}/reply/{replyId}", () => {
        beforeAll(() => {
            let question = {
                "id": "6253511f-0234-4eb2-ba8d-7c8fe04a9951",
                "productId": "1",
                "clientId": "1",
                "questionText": "How is this?",
                "dateCreated": "2021-01-08T14:50:51.850Z",
                "replies": [
                    {
                        "id": "4321511f-1234-4eb2-ba8d-7c8fe04a9951",
                        "clientId": "2",
                        "body": "Good",
                        "date": "2021-01-12T14:50:51.850Z"
                    },
                    {
                        "id": "1231511f-1234-4eb2-ba8d-7c8fe04a9123",
                        "clientId": "3",
                        "body": "Not that good",
                        "date": "2021-01-15T14:50:51.850Z"
                    }
                ]
            };
        });

        it("Should delete the reply with the given id from the question with the given id", () => {
            Question.updateOne = jest.fn().mockImplementation(() => {
                return {
                    lean: jest.fn(() => Promise.resolve({ n: 1 }))
                }
            });

            return request(app)
                .delete(API_PATH.concat("/question/6253511f-0234-4eb2-ba8d-7c8fe04a9951/reply/1231511f-1234-4eb2-ba8d-7c8fe04a9123"))
                .set(AUTHORIZATION, DUMMY_TOKEN)
                .then((response) => {
                    expect(response.status).toBe(201);
                });
        });

        it("Should return 404 since the given reply id does not exist", () => {
            Question.updateOne = jest.fn().mockImplementation(() => {
                return {
                    lean: jest.fn(() => Promise.resolve({ n: 0 }))
                }
            });

            return request(app)
                .delete(API_PATH.concat("/question/6253511f-0234-4eb2-ba8d-7c8fe04a9951/reply/34"))
                .set(AUTHORIZATION, DUMMY_TOKEN)
                .then((response) => {
                    expect(response.status).toBe(404);
                });
        });
    });

    describe("PUT /question/{questionId}/reply/{replyId}", () => {
        beforeEach(() => {
            let reply = {};
        });

        it("Should edit the reply with the given id from the question from the given id and return 201", () => {
            reply = {
                "clientId": "1",
                "body": "Test updated first reply"
            };

            Question.updateOne = jest.fn().mockImplementation(() => {
                return {
                    lean: jest.fn(() => Promise.resolve({ n: 1 }))
                }
            });

            return request(app)
                .put(API_PATH.concat("/question/ecf4e877-0bba-424c-996a-dfc753b402b8/reply/ead85c21-83c3-4c01-a723-331949ab822b"))
                .send(reply)
                .set(AUTHORIZATION, DUMMY_TOKEN)
                .then((response) => {
                    expect(response.statusCode).toBe(201);
                });
        });

        it("Should return 404 since there is no reply with the given id", () => {
            Question.updateOne = jest.fn().mockImplementation(() => {
                return {
                    lean: jest.fn(() => Promise.resolve({ n: 0 }))
                }
            });

            return request(app)
                .put(API_PATH.concat("/question/ecf4e877-0bba-424c-996a-dfc753b402b8/reply/34"))
                .send(reply)
                .set(AUTHORIZATION, DUMMY_TOKEN)
                .then((response) => {
                    expect(response.statusCode).toBe(404);
                });
        });
    });
});
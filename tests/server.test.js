const app = require('../index.js');
const mongoose = require('mongoose');
const request = require('supertest');
const Review = require('../models/review.model');
const AuthResource = require('../resources/authResource');
const nock = require('nock');

const AUTHORIZATION = "Authorization";
const API_PATH = "/api/v1";
const DUMMY_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7Il9pZCI6IjYwMDQzN2Q5ODU2MzllNDdkYWQ4MmQ4NyIsInVzZXJuYW1lIjoiVGVzdEp1YW5taSIsIm5hbWUiOiJKdWFubWkiLCJzdXJuYW1lIjoiQmxhbmNvIiwiZW1haWwiOiJqdWFibGFmZXJAYWx1bS51cy5lcyIsInBob25lIjoiNjY2MTExMjIyIiwiX192IjowfSwiaWF0IjoxNjExNTAzNjM3LCJleHAiOjE2MTE1OTAwMzd9.jif7EwqqJ2dfyiaQHFyBU3K2qDartO-u3CkIWu04GtM";
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
        let review = {};
        beforeAll(() => {
            review = {
                    "title": "Test 2",
                    "score": 3,
                    "description": "Good thing",
                    "reviewerClientId": "TestJuanmi",
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

        it("Should delete the review with the given id and return 204", () => {
            Review.deleteOne = jest.fn().mockImplementation(() => {
                return Promise.resolve({ deletedCount: 1 })
            });

            Review.findOne = jest.fn().mockImplementation(() => {
                return {
                    lean: jest.fn(() => Promise.resolve(review))
                }
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

    describe("GET /reviews/author/{clientId}", () => {
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


        it("Should return the reviews of the author with the given id", () => {
            Review.find = jest.fn().mockImplementation(() => {
                return {
                    lean: jest.fn(() => Promise.resolve(reviews))
                }
            });

            return request(app)
                .get(API_PATH.concat("/reviews/author/2"))
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
                .get(API_PATH.concat("/reviews/author/34"))
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


    describe("DELETE /reviews/author/{clientId}", () => {
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

        it("Should delete all the reviews of the author with the given id and return 204", () => {
            Review.deleteMany = jest.fn().mockImplementation(() => {
                return Promise.resolve({ deletedCount: 2 })
            });

            return request(app)
                .delete(API_PATH.concat("/reviews/author/2"))
                .set(AUTHORIZATION, DUMMY_TOKEN)
                .then((response) => {
                    expect(response.status).toBe(204);
                });
        });

        it("Should return 404 since the given author id does not exist", () => {
            Review.deleteMany = jest.fn().mockImplementation(() => {
                return Promise.resolve({ deletedCount: 0 })
            });

            return request(app)
                .delete(API_PATH.concat("/reviews/author/34"))
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
        let review = {};
        beforeAll(() => {
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
                        "clientId": "TestJuanmi",
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

            Review.findOne = jest.fn().mockImplementation(() => {
                return {
                    lean: jest.fn(() => Promise.resolve(review))
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

            Review.findOne = jest.fn().mockImplementation(() => {
                return {
                    lean: jest.fn(() => Promise.resolve(review))
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
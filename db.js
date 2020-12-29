let mongoose = require('mongoose')

const SERVER = 'testcluster.baz6y.mongodb.net';
const DATABASE = 'fafago_test';
const USER = process.env.DB_USER;
const PASSWORD = process.env.DB_PASSWORD;
const OPTIONS = 'retryWrites=true&w=majority';


function connect() {
    mongoose.connect(`mongodb+srv://${USER}:${PASSWORD}@${SERVER}/${DATABASE}?${OPTIONS}`, { useNewUrlParser: true, useUnifiedTopology: true });
}

module.exports.connect = connect;
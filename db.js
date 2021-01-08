let mongoose = require('mongoose')

const SSL = false;
const AUTH = false;
const SERVER = 'localhost';
const PORT = 27017
const DATABASE = 'fafago_test';
const USER = process.env.DB_USER;
const PASSWORD = process.env.DB_PASSWORD;
const OPTIONS = 'retryWrites=true&w=majority';

let databaseFullURL = 'mongodb' + (SSL ? '+srv://': '://') + (AUTH ? `${USER}:${PASSWORD}@${SERVER}` : `${SERVER}`) + (SSL ? `/${DATABASE}?${OPTIONS}` : `:${PORT}/${DATABASE}?${OPTIONS}`);

function connect() {
  //  mongoose.connect(`mongodb+srv://${USER}:${PASSWORD}@${SERVER}/${DATABASE}?${OPTIONS}`);
    mongoose.connect(databaseFullURL, { useNewUrlParser: true, useUnifiedTopology: true });
}

module.exports.connect = connect;
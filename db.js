let mongoose = require('mongoose')

const SSL =  process.env.DB_SSL;
const AUTH =  process.env.DB_AUTH;
const SERVER =  process.env.DB_SERVER;
const PORT =  process.env.DB_PORT;
const DATABASE =  process.env.DB_NAME;
const USER = process.env.DB_USER;
const PASSWORD = process.env.DB_PASSWORD;
const OPTIONS = 'retryWrites=true&w=majority';

let databaseFullURL = 'mongodb' + (SSL ? '+srv://': '://') + (AUTH ? `${USER}:${PASSWORD}@${SERVER}` : `${SERVER}`) + (SSL ? `/${DATABASE}?${OPTIONS}` : `:${PORT}/${DATABASE}?${OPTIONS}`);

function connect() {
  //  mongoose.connect(`mongodb+srv://${USER}:${PASSWORD}@${SERVER}/${DATABASE}?${OPTIONS}`);
    mongoose.connect(databaseFullURL, { useNewUrlParser: true, useUnifiedTopology: true });
}

module.exports.connect = connect;
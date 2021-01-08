let mongoose = require('mongoose')

const SSL =  process.env.DB_SSL == 'true';
const AUTH =  process.env.DB_AUTH == 'true';
const SERVER =  process.env.DB_SERVER;
const PORT =  process.env.DB_PORT;
const DATABASE =  process.env.DB_NAME;
const USER = process.env.DB_USER;
const PASSWORD = process.env.DB_PASSWORD;
const OPTIONS = 'retryWrites=true&w=majority';

console.log(AUTH )
let databaseFullURL = 'mongodb' + (SSL ? '+srv://': '://') + (AUTH == 'true' ? `${USER}:${PASSWORD}@${SERVER}` : `${SERVER}`) + (SSL ? `/${DATABASE}?${OPTIONS}` : `:${PORT}/${DATABASE}?${OPTIONS}`);

function connect() {
    console.log(AUTH )
    console.log('DB URL' + databaseFullURL)
  //  mongoose.connect(`mongodb+srv://${USER}:${PASSWORD}@${SERVER}/${DATABASE}?${OPTIONS}`);
    mongoose.connect(databaseFullURL, { useNewUrlParser: true, useUnifiedTopology: true });
}

module.exports.connect = connect;
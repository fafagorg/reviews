let mongoose = require('mongoose')

const SERVER = '';
const DATABASE = '';
const USER = '';
const PASSWORD = '';
const OPTIONS = '';

function connect() {
    mongoose.connect(`mongodb+srv://${USER}:${PASSWORD}@${SERVER}/${DATABASE}?${OPTIONS}`);
}

module.exports.connect = connect;
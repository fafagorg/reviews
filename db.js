let mongoose = require('mongoose')

function connect(connectToTestDatabase) {
    url = generateUrl(connectToTestDatabase);
    return mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });
}

function generateUrl(generateForTests) {
    let SSL_TEST = (process.env.DB_SSL || 'false') == 'true';
    let AUTH_TEST = (process.env.DB_AUTH || 'false') == 'true';
    let SERVER_TEST = generateForTests ? 'localhost' : process.env.DB_SERVER;
    let PORT_TEST = (process.env.DB_PORT || '27017');
    let DATABASE_TEST = (process.env.DB_NAME || 'fafago_test');
    let USER_TEST = (process.env.DB_USER || 'user');
    let PASSWORD_TEST = (process.env.DB_PASSWORD || 'pass');
    let OPTIONS_TEST = 'retryWrites=true&w=majority';

    return 'mongodb' + (SSL_TEST ? '+srv://' : '://') + (AUTH_TEST == 'true' ? `${USER_TEST}:${PASSWORD_TEST}@${SERVER_TEST}` : `${SERVER_TEST}`) + (SSL_TEST ? `/${DATABASE_TEST}?${OPTIONS_TEST}` : `:${PORT_TEST}/${DATABASE_TEST}?${OPTIONS_TEST}`);
}

module.exports.connect = connect;
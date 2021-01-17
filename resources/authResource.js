const urljoin = require('url-join');
const request = require('request-promise-native').defaults({json: true});

const prefix = "[AUTH_RESOURCE] ";

class AuthResource {
    static authUrl(resourceUrl) {
        const authServer = (process.env.AUTH_URL || 'http://51.103.75.211/api/v1');
        return urljoin(authServer, resourceUrl);
    }

    static requestBody(jwt) {
        return {
            token: jwt
        }
    }

    static auth(jwt) {
        console.log(addLogPrefix("Validating JWT..."));
        const url = AuthResource.authUrl('/auth/validate');
        const options = {
            body: AuthResource.requestBody(jwt)
        }

        return request.post(url, options);
    }

    static register(username, name, surname, email, phone, password) {
        const url = AuthResource.authUrl('/auth/register');
        const options = {
            body: {
                "username": username,
                "name": name,
                "surname": surname,
                "email": email,
                "phone": phone,
                "password": password
            }
        }

        return request.post(url, options);
    }

    static login(username, password) {
        const url = AuthResource.authUrl('/auth/login');
        const options = {
            body: {
                "username": username,
                "password": password
            }
        }

        return request.post(url, options);
    }
}

// ----------------- Helper methods -----------------

function addLogPrefix(message) {
    return new Date().toISOString() + " - " + prefix.concat(message);
}

module.exports = AuthResource;
"use strict";

//OnetWebService is a constructor function that creates a new object with the properties of username and version.
// The username property is set to the username argument passed into the function.
// The version property is set to the version argument passed into the function.
// The version argument is set to the default value of 'v1' if no argument is passed into the function.

function OnetWebService(username) {
    this._config = {
        auth: {
            username: username
        }
    };
    this.set_version();
}

/*OnetWebService then sets the version of the API that you want to use.
 If you don't specify a version, it will default to the latest version.
    If you specify a version, it will use that version. */

OnetWebService.prototype.set_version = function (version) {
    if (version === undefined) {
        this._config.baseURL = 'https://services.onetcenter.org/ws/';
    } else {
        this._config.baseURL = 'https://services.onetcenter.org/v' + version + '/ws/';
    }
};

//following function takes a query, encodes it and returns it as such:
// It takes a query object and returns a string of the query
// It encodes the query object into a string
// It encodes the query object into a string and returns it
// It takes a query object and returns a string of the query

OnetWebService.prototype._encode_query = function (query) {
    return Object.keys(query).map(function (key) {
        var nkey = encodeURIComponent(key);
        var vals = query[key];
        if (!Array.isArray(vals)) {
            vals = [query[key]];
        }
        return vals.map(function (value) {
            return nkey + '=' + encodeURIComponent(value);
        }).join('&');
    }).join('&');
}

// following function makes a call to the Onet Web Service API.
// It takes in two parameters:
// url: the url of the API call
// callback: the function that will be called when the API call is complete
// Sets up the responses for certain errors, returning nothing
// It uses the XMLHttpRequest object to make the API call.
// It sets the request header to accept JSON.
// It sets the timeout to 10 seconds.
// It sets the ontimeout, onerror, and onload functions.
// It sends the request.

OnetWebService.prototype._call_xhr = function (url, callback) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.timeout = 10000;
    xhr.setRequestHeader('Accept', 'application/json');
    xhr.ontimeout = function (e) {
        callback({ error: 'Call to ' + url + ' failed with no response from server' });
    };
    xhr.onerror = function (e) {
        if (xhr.statusText != '') {
            callback({ error: 'Call to ' + url + ' failed with reason: ' + xhr.statusText });
        } else {
            callback({ error: 'Call to ' + url + ' failed with unknown reason' });
        }
    };
    xhr.onload = function (e) {
        if (xhr.readyState == 4) {
            if (xhr.status === 200 || xhr.status === 422) {
                callback(JSON.parse(xhr.responseText));
            } else {
                callback({ error: 'Call to ' + url + ' failed with error code ' + xhr.status });
            }
        }
    };
    xhr.send();
};

//the Onet Web Service API 

//BREAKDOWN:
// It takes two parameters:
// 1. url - the url of the API call
// 2. callback - the function to call when the API call is complete

OnetWebService.prototype._call_fetch = function (url, callback) {
    fetch(url, {
        method: 'GET',
        mode: 'cors',
        credentials: 'omit',
        headers: {
            'Accept': 'application/json'
        }
    })

        // The fetch API is asynchronous.
        // The fetch API returns a promise.
        // The promise is resolved when the API call is complete.
        // The promise is rejected if the API call fails.

        .then(function (response) {
            if (response.status == 200 || response.status == 422) {
                response.json()
                    .then(callback)
                    .catch(function (error) {
                        callback({ error: 'Call to ' + url + ' failed on JSON parse' });
                    });
            } else {
                callback({ error: 'Call to ' + url + ' failed with error code ' + response.status });
            }
        })
        .catch(function (error) {
            if (error.message) {
                callback({ error: 'Call to ' + url + ' failed with reason: ' + error.message });
            } else {
                callback({ error: 'Call to ' + url + ' failed with unknown reason' });
            }
        });
};

// The fetch API returns a response object.
// The response object has a status property.
// The status property is the HTTP status code of the response.

OnetWebService.prototype.call = function (path, query, callback) {
    var url = this._config.baseURL + path + '?client=' + encodeURIComponent(this._config.auth.username);

    // The response object has a json() method.
    // The json() method returns a promise.

    if (query !== null && query !== undefined) {
        url += '&' + this._encode_query(query);
    }
    // The promise is resolved when the response body is parsed as JSON.
    // The promise is rejected if the response body cannot be parsed as JSON.

    if (self.fetch) {
        this._call_fetch(url, callback);
    } else {
        this._call_xhr(url, callback);
    }

    // The fetch API call is wrapped in a try/catch block.
    // The try/catch block catches any errors that occur during

};

/**
 * Retrieve a YoutubeAPI Key from their scripts loaded on the Google Developers
 * website.
 * It can then be used to execute suche queries:
 * `curl 'https://content.googleapis.com/youtube/v3/channels?part=snippet&forUsername=<username>&key=<retrieved-key>' -H 'X-Origin: https://developers.google.com'`
 * @module youtube-key-finder
 * @author Nicolas Gotchac
 * @version 0.0.1
 * @example
 * var youtubeKeyFinder = require('youtube-key-finder');
 *
 * youtubeKeyFinder.getKey(function(err, apiKey) {
 *     if (err) return console.error(err);
 *     console.log(apiKey);
 * });
 */

var esprima = require('esprima'),
    https = require('https'),
    Promise = require('bluebird');

module.exports = {
    getKey: getKey
};

/**
 * Get a Key that can be used for *some* queries to the Youtube API.
 *
 * @param {Function} callback - A Node style callback, error first, data last
 */
function getKey(callback) {
    getScriptKeys()
        .then(function(keys) {
            Promise
                .any(keys.map(getApiKeyFromKey))
                .then(callback.bind(null, null), callback.bind(null));
        }, callback.bind(null));
}

/**
 * Retrieve the keys used to get the script which contains the API Key.
 * Return a promise that resolve with an {Array} of keys.
 *
 * @private
 * @returns {Promise}
 */
function getScriptKeys() {
    return new Promise(function(resolve, reject) {
        var requestOptions = {
            hostname: 'apis-explorer.appspot.com',
            port: 443,
            path: '/embedded/com.google.api.explorer.Embedded.nocache.js',
            method: 'GET'
        };

        var code = '';
        var req = https.request(requestOptions, function(res) {
            res.on('data', function(data) {
                code += data;
            });
        });

        req.end();

        req.on('error', reject);

        req.on('close', function() {
            var parsedCode = esprima.parse(code);

            var results = find(function(data) {
                return (data.type === 'ExpressionStatement') &&
                        (data.expression.type === 'CallExpression') &&
                        (data.expression.callee) &&
                        (data.expression.callee.name === 'unflattenKeylistIntoAnswers');
            }, parsedCode);

            var keys = results.reduce(function(prev, data) {
                var args = data.expression.arguments
                    .filter(function(argument) {
                        return argument.type === 'Literal' && argument.value;
                    }).map(function(argument) {
                        return argument.value;
                    });

                return prev.concat(args);
            }, []);

            resolve(keys);
        });
    });
}

/**
 * Retrieve the actual API Key from the second scripts, which name / URL is
 * a function of the given Script Key (`key`).
 *
 * @param {String} key - A script key that will be used in the path of the script to load,
 *                       which will contain the API Key.
 * @returns {Promise}
 */
function getApiKeyFromKey(key) {
    return new Promise(function(resolve, reject) {
        var requestOptions = {
                hostname: 'apis-explorer.appspot.com',
                port: 443,
                method: 'GET',
                path: '/embedded/' + key + '.cache.js'
            },
            code = '';

        var req = https.request(requestOptions, function(res) {
            res.on('data', function(data) {
                code += data;
            });
        });

        req.end();

        req.on('error', reject);

        req.on('close', function() {
            try {
                var parsedCode = esprima.parse(code);

                var results = find(function(node) {
                    return (node.type === 'VariableDeclarator') &&
                            (node.id && node.id.name === 'API_KEY');
                }, parsedCode);

                var apiKeys = results.map(function(node) {
                    return node.init.value;
                });

                if (!apiKeys.length) reject('No API Key found [' + key + ']');

                resolve(apiKeys.pop());
            } catch (e) {
                reject('Error while parsing [' + key + ']: ' + e.toString());
            }
        });
    });
}

/**
 * Returns the Nodes from the given Esprima parsed script that matches the
 * application of the given test function to it.
 * It will recurse thourgh the nodes children (via the `body`, `block` or `declarations`
 * properties).
 *
 * @param {Function} test - A function used to test if a certain Node must be returned or not.
 * @param {Object} data - An esprima data Object
 * @returns {Object[]}
 */
function find(test, data) {
if (!data) return [];

    var results = [],
        children = [];

    if (data.body) children = children.concat(data.body);
    if (data.block) children = children.concat(data.block);
    if (data.declarations) children = children.concat(data.declarations);

    children.forEach(function(child) {
        results = results.concat(find(test, child));
    });

    if (test(data)) results.push(data);

    return results;
}


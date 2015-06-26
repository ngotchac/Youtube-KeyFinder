/* eslint no-unused-expressions: 0 */
var expect = require('chai').expect;
var https = require('https');

var youtubeKeyFinder = require('../');

describe('Youtube KeyFinder', function() {
    describe('#getKey', function() {
        it('should be able to retrieve an Youtube API Key', function(done) {
            this.timeout(20000);

            youtubeKeyFinder.getKey(function(err, key) {
                if (err) throw err;

                expect(key).to.not.be.empty;
                done();
            });
        });

        it('should retrieve a valid API Key', function(done) {
            this.timeout(40000);

            youtubeKeyFinder.getKey(function getKeyCallback(err, key) {
                if (err) throw err;

                var httpsOptions = {
                    host: 'content.googleapis.com',
                    method: 'GET',
                    port: 443,
                    path: '/youtube/v3/channels?part=snippet&forUsername=ngotchac&key=' + key,
                    headers: {
                        'X-Origin': 'https://developers.google.com'
                    }
                };

                var data = '';
                var request = https.request(httpsOptions, function onHttpsResponse(res) {
                        expect(res.statusCode).to.be.equal(200);

                        res.on('data', function onHttpsData(input) {
                            data += input;
                        });
                    });

                request.end();

                request.on('error', function onHttpsError(error) {
                    throw error;
                });

                request.on('close', function onHttpsClose() {
                    try {
                        var response = JSON.parse(data);

                        expect(response.items).to.exist;
                        expect(response.items).to.not.be.empty;

                        var firstItem = response.items[0];

                        expect(firstItem.snippet).to.exist;
                        expect(firstItem.snippet.title).to.exist;
                        expect(firstItem.snippet.title).to.be.equal('Nicolas Gotchac');

                        done();

                    } catch (e) {
                        throw e;
                    }
                });
            });
        });
    });
});



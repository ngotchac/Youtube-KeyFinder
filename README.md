#Youtube Key-Finder
[![Build Status](https://travis-ci.org/ngotchac/Youtube-KeyFinder.svg?branch=master)](https://travis-ci.org/ngotchac/Youtube-KeyFinder)
[![Coverage Status](https://coveralls.io/repos/ngotchac/Youtube-KeyFinder/badge.svg?branch=master)](https://coveralls.io/r/ngotchac/Youtube-KeyFinder?branch=master)

This very small module will retrieve a valid API Key to use for making calls
to the Youtube API.

It will only work with calls that *does not* require an Authentication.
You can test them [here](https://developers.google.com/youtube/v3/docs) by making
calls from the given Console without enabling the *OAuth* Authentication.

## Usage

```javascript
var youtubeKeyFinder = require('youtube-key-finder');

youtubeKeyFinder.getKey(function(err, apiKey) {
    if (err) return console.error(err);
    console.log(apiKey);
});
```

## Use the key

For example, this will retrieve a snippet of the given user's info:
```bash
$> curl 'https://content.googleapis.com/youtube/v3/channels?part=snippet&forUsername=<username>&key=<retrieved-key>' -H 'X-Origin: https://developers.google.com'
```

## Caution

This was only made for an experiment with [Esprima](http://esprima.org/) and is not supposed to be used beside testing.

## Test

The test runs with `mocha` and `chai`
```bash
$> npm test
```

## CLI

You can use the CLI to get the API Key
```bash
$> [sudo] npm install -g ngotchac/Youtube-KeyFinder
$> youtube-key-finder
```


#### Enjoy!


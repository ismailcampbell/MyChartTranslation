'use strict';

// let fs = require ('fs');
// let https = require ('https');
const util = require('util');
var log = require('fancy-log');


const request = require('request');
const { v4: uuidv4 } = require('uuid')


let options = {
    method: 'POST',
    baseUrl: 'https://api.cognitive.microsofttranslator.com/',
    url: 'translate',
    qs: {
      'api-version': '3.0',
      'to': 'en',
      'scope': 'translation'
    },
    headers: {
      'Ocp-Apim-Subscription-Key': `42d0bed6cdc74cd283653d51a6ff5bbc`,
      'Content-type': 'application/json',
      'X-ClientTraceId': uuidv4().toString()
    },
    body: [{
          'text': ''
    }],
    json: true,
};



let Translate = function (content) { 

    return new Promise(function(resolve, reject) { 
        log (`Translating`)
        // log (`Content: ${content}`)
        // log (`Options: ${options.body[0]['text']}`)
        options.body[0]['text']= content;
        // log (`OptionsChanges: ${options.body[0]['text']}`)
        request(options, function(err, res, body){
            // let tranlateResults = JSON.stringify(body, null, 4);
            let translateResults = body;
            // log (JSON.stringify(tranlateResults,null,4))
            // log (`Translation Results: ${tranlateResults}`);
            log (`Translate results`)
            log(util.inspect(translateResults, {showHidden: false, depth: null}));
            log (`*****`)
            resolve (translateResults);
        });

    })
}

 module.exports.Translate = Translate;


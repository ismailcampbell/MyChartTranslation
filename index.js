// Core
const Koa = require('koa');
const Router = require('@koa/router');
const json = require('koa-json');
const cors = require('@koa/cors');

// Static/utility
const serve = require('koa-better-serve');
const http = require('node:http');
const https = require('node:https'); 
const fs = require('node:fs'); 
const enforceHttps = require('koa-sslify').default;
const Handlebars = require('handlebars');
// Body parsing
const { koaBody } = require('koa-body');
const translationAPI = require('./v3_translate.js');
const lang = require('./langLook.js');
const Iog = require('iog');
const app = new Koa();
const logger = new Iog('my-module-name');

var log = require('fancy-log');
var util = require("util");
var router = new Router();
var appData = {
 "translationSource" : " ",
 "translationResults" : " ",
 "SourceLanguage": "",
 "RequestURL": ""
}
const config = {
  "httpPort": 3010,
  "httpsPort": 1025, 
  "accessKey": "cEQYUIaFOU41LXFnMSXA6fYEoop7Ztoq"
}
app
  .use(router.routes())
  .use(router.allowedMethods())
  .use(koaBody())
  .use(json())
  .use(cors())
  .use(serve('./public'))
  .use(enforceHttps());

router.get ('api','/api/:text', async (ctx,next) => { 
  ctx.body = await pageGenerator ();
})

router.get ('v2','/v2/', async (ctx,next) => { 
  log (`Request received`)

  if (ctx.query.key == config.accessKey) {
    log (`Access key accepted`)
    
    try {
      appData.translationSource = joinedParagraphs(ctx.query.text);

      let content = decodeURIComponent(ctx.query.text)
      let newText =  await translationAPI.Translate(content)
      console.log(util.inspect(newText, {showHidden: false, depth: null}));

      appData.SourceLanguage= await lang.langLook(newText[0].detectedLanguage.language);
      appData.translationResults = joinedParagraphs(newText[0].translations[0].text)

      ctx.body = await pageGenerator ()
      log (`Information sent`)
    }
    catch (error) {
      log.error (error)
    }
  }
  else {
    log (`Request without access key`)
    ctx.body = "Access Denied"
  }
})
router.get ('translate','/translate/:text', async (ctx,next) => {
  try {
    log (`Request received`)
    
    appData.translationSource = decoded

    let content = JSON.stringify ([{'Text' : decoded}]);
    let newText =  await translationAPI.Translate(content)
    let parsedText = JSON.parse (newText[0].translations[0].text)
    
    appData.translationResults = parsedText[0].Text
    appData.RequestURL= decoded
    
    ctx.body = await pageGenerator ()
    log (`Information sent`)
  }
  catch (error) {
    log.error (error)
  }
})

function joinedParagraphs(translationResults) {
  let sentences = translationResults.split(".");
  log(sentences)
  let paragraphs = []
  let currentParagraph = 0
  sentences.forEach((sentence, index) => {
    if (index % 4 === 0) {
      if (index !== 0)
        currentParagraph++
      paragraphs[currentParagraph] = [`${sentence}`]
      log(paragraphs)
    }
    else {
      paragraphs[currentParagraph] = [...paragraphs[currentParagraph], sentence]
    }
  });
  let joinedParagraphs = paragraphs.map(sentenceArr => `${sentenceArr.join(".")}.`)
  log(joinedParagraphs)
  return joinedParagraphs;
}

async function pageGenerator() {
  return new Promise((resolve, reject) => {
    try {
      var source = `<!DOCTYPE html>
      <html>
      <head>
        <!-- <meta charset="utf-8" /> -->
        <!--[if lt IE 9]><script src="https://cdnjs.cloudflare.com/ajax/libs/html5shiv/3.7.3/html5shiv.min.js"></script><![endif]-->
        <title>Yale New Haven Health Auto-Translate</title>
        <meta name="keywords" content="" />
        <meta name="description" content="" />
        <link href="../css/style.css" rel="stylesheet">
        <link href="https://fonts.googleapis.com/css?family=Poppins" rel="stylesheet">	
        <script>
        </script>
      </head>
      
      <body>
      
      <div class="wrapper">
      
        <header class="header">
          <img id="hl" src="../img/translate.png" height="60%" width=auto>	
          <strong id="title"> Auto-Translate</strong> 
        </header><!-- .header-->
      
        <div class="middle">
            
          <aside class="left-sidebar">
            <b><h3>Source:</h3></b>
            {{#each translationSource}} 
            <p>{{this}}</p>
            {{/each}} 
          </aside><!-- .left-sidebar -->
      
          <aside class="right-sidebar">
            <b><h3>Translation:</h3></b> 
            {{#each translationResults}} 
            <p>{{this}}</p>
            {{/each}}
            </aside><!-- .right-sidebar -->
      
        </div><!-- .middle-->
        
        <h5 id="discl"> This is computer generated translation. Please use only as a reference   </h5>
      </div><!-- .wrapper -->
      
      <footer class="footer">
          <img src="../img/YNHHSLogo.png" height=auto width="20%">
        </footer> <!-- .footer -->
      
      </body>
      
      </html>`;

      var template = Handlebars.compile(source);

      var result = template(appData);
      resolve(result)
    }
    catch (error) {
      reject(error)
    }
  })
}

var options = {
  key: fs.readFileSync('cert/server.key'),
  cert: fs.readFileSync('cert/server.crt')
}

// app.listen(config.port, () => console.log(`TranslationApp listening on port ${config.port}`))

http.createServer(app.callback()).listen(config.httpPort);
https.createServer(options, app.callback()).listen(config.httpsPort);
let msgServ = `  Translate application listening on the following ports:
- HTTP : ${config.httpPort}
- HTTPS: ${config.httpsPort}`

// logger.write(msgServ);
log (msgServ)

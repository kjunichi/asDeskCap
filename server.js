/**
* Module dependencies.
*/

var logger = require('koa-logger');
var serve = require('koa-static');
var parse = require('co-busboy');
var koa = require('koa');
var fs = require('fs');
var app = koa();

function addVideo(path) {
 var vtag = document.createElement("video");
 vtag.src=path.replace("C:/work/atomShell/desktopCap/uploads/","/uploads/");
 var list = document.getElementById("videos");
 list.appendChild(vtag);
 
}
// log requests

app.use(logger());

// custom 404

app.use(function *(next){
  yield next;
  if (this.body || !this.idempotent) return;
  this.redirect('/404.html');
});

// serve files from ./public

app.use(serve(__dirname + '/public'));

// handle uploads

app.use(function *(next){
  // ignore non-POSTs
  if ('POST' != this.method) return yield next;

  // multipart upload
  var parts = parse(this);
  var part;

  while (part = yield parts) {
    var stream = fs.createWriteStream(__dirname + '/public/uploads/' + Math.random()+"_"+part.filename);
    part.pipe(stream);
    console.log('uploading %s -> %s', part.filename, stream.path);
    addVideo(stream.path);
  }

  this.redirect('/');
});

// listen


var https = require('https');
var options = {
  key: fs.readFileSync(__dirname +"/key.pem"),
  cert: fs.readFileSync(__dirname +"/cert.pem")
};
https.createServer(options, app.callback()).listen(4430);

app.listen(3000);
console.log('listening on port 3000');

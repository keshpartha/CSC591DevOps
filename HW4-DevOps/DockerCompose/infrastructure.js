var http      = require('http');
var exec = require('child_process').exec;
var request = require("request");
var express = require('express')
var app = express();

var server = app.listen(7777, function() {
    var host = 'http://localhost';
    port = server.address().port

    console.log('infrastructure listening at '+host+':'+port);
});


app.get('/spawn/:serverCount', function(req, res) {

    var scaleCount = parseInt(req.params.serverCount) + 1;

    var scaleCommand = 'docker-compose scale app=' + scaleCount;

    exec(scaleCommand, function(err, out, code) 
    {
      console.log("Launching new container for App");
      if (err instanceof Error)
        throw err;
      if( err )
      {
        console.error( err );
      }
    });
})
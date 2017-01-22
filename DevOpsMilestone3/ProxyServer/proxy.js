var http      = require('http');
var httpProxy = require('http-proxy');
var request = require('request');
var redis = require('redis');
var fs = require('fs');
var redisServer = fs.readFileSync("/etc/keys/redis.json");
var redisDetails = JSON.parse(redisServer);
var getIP = require('external-ip')();

var client = redis.createClient(parseInt(redisDetails.redisPort), redisDetails.redisIp, {})

var proxy = httpProxy.createProxyServer({});

var server = http.createServer(function(req, res) {

	client.exists('scalecount', function(err, reply) {
	    if (reply === 1) {
	    	client.incr("scalecount", function(err, reply) {
    			console.log(reply+'');
			});
	    } else {
	        client.set("scalecount", 1);
	        client.expire("scalecount", 900);
	    }
	});

	client.rpoplpush('servers', 'servers', function(err, value) {

		console.log('Proxy redirected to '+ value);
		proxy.web(req, res, { target: value });
	})
  
})

console.log("Proxy listening on port 8081")

getIP(function (err, ip) {
	var host = server.address().address
	var port = server.address().port
	client.lrem("proxyservers",0,"http://"+ip+":"+port, function(err, reply) {
		client.lpush("proxyservers","http://"+ip+":"+port, function(err, reply) {
			console.log(reply);
		});
	});
});

server.listen(8081);

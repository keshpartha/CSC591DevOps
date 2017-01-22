var redis = require('redis')
var multer = require('multer')
var express = require('express')
var fs = require('fs')
var app = express()
    // REDIS
var client = redis.createClient(6379, 'redis', {})

var port;

///////////// WEB ROUTES

// Add hook to make it easier to get all visited URLS.
app.use(function(req, res, next) {

    client.lpush("urls", req.url, function(err, value) {
        client.ltrim("urls", 0, 4, function(err, value) {});
    });

    next(); // Passing the request to the next handler in the stack.
});

app.get('/recent', function(req, res) {
    client.lrange("urls", 0, 4, function(err, value) {
        res.send(value);
    });
})

app.get('/', function(req, res) {
    res.send('hello world');
})


app.get('/set/:key', function(req, res) {
    client.set("key", req.params.key);
    client.expire("key", 10);
    res.send("key has been set");

})

app.get('/get', function(req, res) {
    client.get("key", function(err, value) {
        res.send(value);
    });
})

app.post('/upload', [multer({
    dest: './uploads/'
}), function(req, res) {

    if (req.files.image) {
        fs.readFile(req.files.image.path, function(err, data) {
            if (err) throw err;
            var img = new Buffer(data).toString('base64');
            client.lpush("images", img, function(err, value) {});
            console.log("Image has been uploaded");
        });
    }

    res.status(204).end()
}]);

app.get('/meow', function(req, res) {
    {
        res.writeHead(200, {
            'content-type': 'text/html'
        });
        client.lpop("images", function(err, imagedata) {
            if (imagedata) {
                res.write("<h1>\n<img src='data:my_pic.jpg;base64," + imagedata + "'/>");
            } else {
                res.write("No images in queue to display")
            }
            res.end();
        });
    }
})

app.get('/spawn', function(req, res) {

    client.llen('servers', function(err, value) {
        res.redirect('http://localhost:7777/spawn/'+value);
    });
})

app.get('/destroy', function(req, res) {

    res.writeHead(200, {
        'content-type': 'text/html'
    });

    client.llen('servers', function(err, value) {
        if (value === 1) {
            res.write('Only 1 server left. Cannot destroy');
            res.end();
        } else {
            var serverIndex = getRandomServer(0, value - 1);
            client.lindex('servers', serverIndex, function(err, serverName) {
                client.lrem('servers', 0, serverName, function(err, value1) {
                    res.write('Server has been destroyed ' + serverName);
                    res.end();
                });
            });
        }

    })
})

app.get('/listservers', function(req, res) {

    res.writeHead(200, {
        'content-type': 'text/html'
    });

    client.llen('servers', function(err, value) {
        client.lrange('servers', 0, value - 1, function(err, servers) {
            res.write('List of available servers is ' + servers);
            res.end();
        })
    })
})
   
// HTTP SERVER
var server = app.listen(3000, function() {
    var host = 'http://app';
    port = server.address().port


    var server1 = '{0}:{1}'.format(host, port);

    client.lpush('servers', server1, function(err, value) {
        console.log('Example app listening at %s', server1);
    });
});

if (!String.prototype.format) {
    String.prototype.format = function() {
        var args = arguments;
        return this.replace(/{(\d+)}/g, function(match, number) {
            return typeof args[number] != 'undefined' ?
                args[number] :
                match;
        });
    };
}

function getRandomServer(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

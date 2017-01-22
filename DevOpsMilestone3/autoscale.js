var http = require('http');
var httpProxy = require('http-proxy');
var request = require('request');
var redis = require('redis');
var fs = require('fs');
var redisServer = fs.readFileSync("./ansible/redis.json");
var needle = require("needle");
var os = require("os");
var redisDetails = JSON.parse(redisServer);
var Ansible = require('node-ansible');

var client = redis.createClient(parseInt(redisDetails.redisPort), redisDetails.redisIp, {})

var config = {};
config.token = process.env.MY_TOKEN;

var headers = {
    'Content-Type': 'application/json',
    Authorization: 'Bearer ' + config.token
};


var doClient = {

    createDroplet: function(dropletName, region, imageName, onResponse) {
        var data = {
            "name": dropletName,
            "region": region,
            "size": "512mb",
            "image": imageName,
            // Id to ssh_key already associated with account.
            "ssh_keys": [3378351,4557331],
            //"ssh_keys":null,
            "backups": false,
            "ipv6": false,
            "user_data": null,
            "private_networking": null
        };

        //console.log("Attempting to create "+ JSON.stringify(data) );

        needle.post("https://api.digitalocean.com/v2/droplets", data, {
            headers: headers,
            json: true
        }, onResponse);
    },

    createInventory: function(dropletID, onResponse) {
        needle.get("https://api.digitalocean.com/v2/droplets/" + dropletID, {
            headers: headers
        }, onResponse);
    },

    tagDroplet: function(dropletID, onResponse) {

        var data = {
            "resources": [{
                "resource_id": dropletID,
                "resource_type": "droplet"
            }]
        };

        needle.post("https://api.digitalocean.com/v2/tags/AppServers/resources", data, {
            headers: headers,
            json: true
        }, onResponse);
    },

    getScaledDroplets: function(onResponse) {
        needle.get("https://api.digitalocean.com/v2/droplets?tag_name=AppServers", {
            headers: headers
        }, onResponse);
    },

    deleteScaledDroplet: function(dropletID, onResponse) {
        console.log(dropletID);
        needle.delete("https://api.digitalocean.com/v2/droplets/" + dropletID, {}, {
            headers: headers
        }, onResponse);
    }
};

var scaling = false;

var region = "nyc1";
var image = "ubuntu-14-04-x64";

function checkRequests() {

    client.exists('scalecount', function(err, reply) {

        if (reply === 1) {

            client.get('scalecount', function(err, value) {

                var requests = parseInt(value);

                if (requests > 5 && !scaling) {
                    scaleUp();
                } else if (!scaling) {
                    scaleDown();
                }

            });
        } else {
            scaleDown();
        }

    });

    setTimeout(checkRequests, 25000);
}

checkRequests();

function scaleUp() {

    scaling = true;
    doClient.createDroplet('ScaledServer' + '', region, image, function(err, resp, body) {
        var data = resp.body;
        // StatusCode 202 - Means server accepted request.
        if (!err && resp.statusCode == 202) {
            console.log("Droplet successfully created");
        }

        console.log("Waiting for Droplet to initialize");

        setTimeout(function() {
            doClient.createInventory(data.droplet.id, function(err, resp) {

                var res_data = resp.body;

                if (resp.headers) {
                    console.log("Calls remaining", resp.headers["ratelimit-remaining"]);
                }

                if (res_data.droplet.id) {
                    var ipAddr = res_data.droplet.networks.v4[0].ip_address;
                    var dropletName = res_data.droplet.name;
                    var inventoryContent = "[" + dropletName + "]\n" + dropletName + " ansible_ssh_host=" + ipAddr + " ansible_ssh_user=root\n";
                    console.log("DropletID is " + res_data.droplet.id);
                    doClient.tagDroplet(res_data.droplet.id, function(err, resp) {
                        console.log("Droplet tagged");
                    });
                }

                fs.writeFile('./ansible/inventory_scale', inventoryContent, function(err) {
                    if (err) throw err;
                    console.log('The content was appended to the inventory file!');
                    setTimeout(function() {
                        runPlaybook();
                    }, 30000)
                });
            });

        }, 30000)

    });
}

function runPlaybook() {

    console.log('Starting playbook');
    var playbook = new Ansible.Playbook().playbook('./ansible/scale-playbook');
    playbook.inventory('./ansible/inventory_scale');
    var promise = playbook.exec();
    promise.then(function(result) {
        console.log(result.output);
        console.log(result.code);
        console.log('Playbook has been executed successfully');
        scaling = false;
    });
    playbook.on('stdout', function(data) {
        console.log(data.toString());
    });
    playbook.on('stderr', function(data) {
        console.log(data.toString());
    })
}

function scaleDown() {

    console.log("Scaling down");

    doClient.getScaledDroplets(function(err, resp) {
        if (resp.body.droplets[0]) {
            var dropletDelete = resp.body.droplets[0].id;
            var ip = resp.body.droplets[0].networks.v4[0].ip_address;
            console.log(resp.body);
            console.log(dropletDelete);
            console.log(ip);

            var serverName = "http://"+ip+":3000";

            client.lrem('servers', 0, serverName, function(err, value1) {
                console.log('Server has been removed from redis' + serverName);
            });

            doClient.deleteScaledDroplet(dropletDelete, function(err, resp) {
                console.log(err);
                console.log(resp.body);
                console.log("Scaled droplet has been deleted");
            });

        } else {
            console.log("No scaled servers exist.");
        }

    });
}
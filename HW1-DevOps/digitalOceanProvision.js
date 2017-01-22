var needle = require('needle');
var os = require('os');
var fs = require('fs');
var sleep = require('sleep');

var config = {};
config.token = process.env.TOKEN;

fs.appendFile('inventory', '[instances]\n', function (err) {
	if(err) {
    	return console.log(err);
	} else {
    	console.log("Inventory File Updated");
   	}
});

var headers =
{
	'Content-Type':'application/json',
	Authorization: 'Bearer ' + config.token
};

var client =
{
	createDroplet: function (dropletName, region, imageName, onResponse)
	{
		var data = 
		{
			"name": dropletName,
			"region":region,
			"size":"512mb",
			"image":imageName,
			// Id to ssh_key already associated with account.
			"ssh_keys":[3378351],
			//"ssh_keys":null,
			"backups":false,
			"ipv6":false,
			"user_data":null,
			"private_networking":null
		};

		needle.post("https://api.digitalocean.com/v2/droplets", data, {headers:headers,json:true}, onResponse );
	},

	configureInventory: function (dropletID, onResponse)
	{
		needle.get("https://api.digitalocean.com/v2/droplets/"+dropletID, {headers:headers}, onResponse)
	}
};


var name = 'rahuja-DO-instance';
var region = 'nyc1';
var image = 'ubuntu-14-04-x64';

client.createDroplet(name, region, image, function(err, resp, body)
{
	console.log('Attempting to create Droplet');
	// StatusCode 202 - Means server accepted request.
	if(!err && resp.statusCode == 202)
	{
		console.log('Droplet created successfully.');
	}

	var dropletId = resp.body.droplet.id;
	console.log("Waiting for droplet to initialize");
	sleep.sleep(60);

	client.configureInventory(dropletId, function(err, resp, body)
	{
		var data = resp.body;

		if( data.droplet.id )
		{
			var dropletName = data.droplet.name;
			var ipAddress = data.droplet.networks.v4[0].ip_address;
			var inventoryContent = dropletName + ' ansible_ssh_host=' + ipAddress + ' ansible_ssh_user=root\n'; 
		}

		fs.appendFile('inventory', inventoryContent, function (err) {
    	if(err) {
        	return console.log(err);
    	} else {
    	console.log("Inventory File Updated for Digital Ocean droplet");
    	}

		});

	});
});



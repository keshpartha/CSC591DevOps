var AWS = require('aws-sdk');
var fs = require('fs');
var sleep = require('sleep');

AWS.config.region = 'us-east-1';

var ec2 = new AWS.EC2();

var params = {
  ImageId: 'ami-8e5fd299', 
  InstanceType: 't1.micro',
  MinCount: 1, MaxCount: 1,
  KeyName: 'AWS-ssh-east'
};

// Create the instance
ec2.runInstances(params, function(err, data) {
  if (err) { console.log("Could not create instance", err); return; }

  var instanceId = data.Instances[0].InstanceId;
  var instanceName = 'rahuja-AWS-instance';
  console.log("Created instance", instanceId);

  // Add tags to the instance
  params = {Resources: [instanceId], Tags: [
    {Key: 'Name', Value: instanceName}
  ]};

  ec2.createTags(params, function(err) {
    console.log("Tagging instance", err ? "failure" : "success");
  });

  params = {
    InstanceIds: [ instanceId ]
  };

  ec2.describeInstances(params, function(err, data) {

    var instanceName = 'rahuja-AWS-instance';
    var ipAddress = data.Reservations[0].Instances[0].PublicIpAddress;
    var inventoryContent = instanceName + ' ansible_ssh_host=' + ipAddress + ' ansible_ssh_user=ubuntu ansible_ssh_private_key_file=/home/rohit910/AWS-ssh-east.pem\n';

    fs.appendFile('inventory', inventoryContent, function (err) {
    if(err) {
      return console.log(err);
    } else {
      console.log("Inventory File Updated for AWS instance");
    }
    });

  });

});






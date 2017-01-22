# HW1-DevOps

Prerequisite:
Ansible should be installed on the host machine.

        pip install ansible

Follow below steps:

1. Install the required dependencies.

        npm install
        
2. Provision a Droplet on Digital Ocean.

        node digitalOceanProvision.js
        
3. Provision an AWS EC2 instance.

        node awsProvision.js
        
4. After initialization install nginx server on both machines using Ansible Playbook.

        ansible-playbook ansible_playbook.yml -i inventory

5. Visit the respective IP adresses to verify that nginx has been successfully installed.

Link to screencast - https://www.youtube.com/watch?v=ohEFSvY-nAE


#### Amazon Web Services(AWS)

AWS offers a suite of reliable, efficient and inexpensive cloud-computing services.

Amazon S3 is an online file storage service. It provides an interface to retrieve and store data from anywhere on the web.
S3 provides an object storage model. In order to store data on S3 the user first needs to create a bucket in any of the 
provided AWS regions. After that data can be retrieved and stored from the bucket.
Some of the most common use cases include - backup and recovery, nearline archive, big data analytics, disaster recovery, cloud applications, and content distribution.

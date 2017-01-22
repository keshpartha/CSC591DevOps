# DevOpsMilestone3

<hr/>

# Members:

* Nikunj Shah - nmshah5
* Rohit Ahuja - rahuja
* Kartikeya Pharasi - kpharas

<hr/>

# About the Project:

Tasks involved:

1. The ability to deploy software to the production environment triggered after build, testing, and analysis stage is completed. The deployment needs to occur on actual remote machine/VM (e.g. AWS, droplet, VCL), and not a local VM.

  How we aim to implement this is to check the test coverage using cobertura and analyze the code using jshint. If it fails, the report is generated in Jenkins. If it is successful the code has to be pushed which runs the Ansible playbooks to deploy the application onto the Production Server.
  
  Link to the Application we have used: https://github.com/nikunj91/SimpleSetsWebApp.git

2. The ability to configure a production environment automatically, including all infrastructure components, such web server, app service, load balancers, and redis stores. Configure should be accopmlished by using a configuration management tool, such as ansible, or docker. Alternatively, a cluster management approach could also work (e.g., kubernates).

  For this tasks we have used Ansible to automatically configure 4 servers on Digital Ocean namely:

  * Redis Server
  * Canary Server
  * Production Server
  * Proxy Server

3. The ability to monitor the deployed application (using at least 2 metrics) and send alerts using email or SMS (e.g., smtp, mandrill, twilio). An alert can be sent based on some predefined rule.

  For this task we have written a python script which makes use of the psutils library and is automatically run on the Production Server. On reaching a certain CPU and memory threshold we have used twilio to send SMS alerts.
  
  ![alt text](https://github.ncsu.edu/kpharas/DevOpsMilestone3/blob/master/SMS_Screenshot.png)

4. The ability to autoscale individual components of production and maintain and track in a central discovery service. Autoscale can be triggered by a predefined rule.

  The logic of our autoscale is that if the request to a particular server exceeds a certain limit we create a new instance on Digital Ocean using a tag which labels it as Scaled Server. After its creation the requests are fluctuated between the various server. When we want to scale down we keep checking in a certain time interval if the requests go down below a level the first server it retreives from the redis store is deleted.

5. The ability to use feature flags, serviced by a global redis store, to toggle functionality of a deployed feature in production.
  
  We deployed an app on the Redis Server to create/delete/list/toggle feature flags. Using these flags we enable/disable certain features in our application. Once a flag is created it is stored in the Global redis store and the feature is Enabled by default. Using the toggle commmand we can Enable or Disable the corresponding feature. Also, we need to incorporate the logic in the application to read from the global redis store and expose the feature depending on the value of the flag.

6. The ability to perform a canary release: Using a proxy/load balancer server, route a percentage of traffic to a newly staged version of software and remaining traffic to a stable version of software. Stop routing traffic to canary if alert is raised.
  
  For this task created a proxy server on port 8080 which will route the traffic between the canary server and the main server in the 1:1 ratio. The canary server will be deployed automatically when there is a commit made to the canary branch as shown in the screencast. The traffic to the server will also be stopped and the server removed from the routing list if it exceeds the usage criteria.

<hr/>

# Screencast : https://youtu.be/sigu9jCYarE

<hr/>

# Steps to run

1. Clone the git repo which contains the playbook and jenkins config files: https://github.ncsu.edu/kpharas/DevOpsMilestone3 
2. Clone the git repo of the application and setup the hooks : https://github.com/nikunj91/SimpleSetsWebApp
3. Set the environment variable MY_TOKEN with the digital ocean token.
4. Run the doServer.js file to create the droplets for each server. This will also create the inventory file.
5. Play the ansible playbook to setup the Redis Server, Canary Server, Production Server and Proxy Server
6. Setup jenkins using the downloaded configuration file from the cloned github repo DevOpsMilestone3
7. Make a change in the application, commit it to build it and then push the change to have it deployed.


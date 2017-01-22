# DevopsSpecialMilestone

## Restart Monkey

The monkey addresses two common use cases:

1. ####Restart the entire cluster of servers<br>
Sometimes we may need to restart our entire cluster of servers after upgrades. In this case we need to take care of the dependencies between the different servers. The cluster restart monkey restarts the servers based on the dependency which is specified. The dependencies are specified in the ansible playbook.<br>
In our example, we have four servers in the cluster: Redis, Proxy, App and Canary Server. The monkey restarts the servers by using the below two playbooks:

  * stopservices.yaml: Stops all services on the cluster in the order defined.
  * restartservices.yaml: Restarts the servers and the services running on them in the order which is defined. Also runs smoke tests on the servers to check if the services are brought up successfully

  #### Steps to run
  
  1. Clone the repository
  2. Create the cluster of servers:

          node doServer.js
  
  3. Configure the provisioned servers:
  
          ansible-playbook provision-playbook.yml -i inventory

  4. Deploy the App Server and the Canary Server:

          ansible-playbook prod-deploy.yml -i inventory
          ansible-playbook prod-canary-deploy.yml -i inventory
          
  5. Create the inventory files of servers which are currently running:

          python createinv.py

  6. Stop all services which are currently running:
          
          ansible-playbook stopservices.yaml -i restartInventory

  7. Restart the services

          ansible-playbook restartservices.yaml -i restartInventory
          

2. ####Restart application servers which are hung or exceed certain CPU usage.
The monkey monitors the app servers which are running the application. Periodically it checks for servers which are either hung or exceed a certain threshold of CPU usage and restarts these servers.

  * If only one server is currently running then it creates a new server and switches the traffic to the new server while the application server is being restarted. 

  * If more than one server is running then it removes this server from the list of servers. Restarts the Server and then adds it back to the list of servers.

  #### Steps to Runs
  
  1. Run Steps 1-4 as defined above.
  2. Run the command to start the python script which monitors the servers which are running:
  
          python restart_monitor.py

  3. Using the stress module simulate stress on one of the Application Servers
  
          stress -c 1 -m 1

  4. The script will monitor the CPU usage which is updated in the global redis store by monitor.py which is running on every application server and if it crosses a certain threshold it will restart the corresponding application serrver. It also checks the timestamp in case the server is hung and can no longer update the CPU usage value in Redis.

###Screencast
https://www.youtube.com/watch?v=7q9yYuWyzbQ&t


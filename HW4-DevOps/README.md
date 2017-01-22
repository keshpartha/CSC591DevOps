# HW4-DevOps
 Docker Part Deux
 
 Name: Rohit Kishore Ahuja
 
 UnityId: rahuja
 
## Docker Compose

Prerequistes: Install docker and docker-compose

Steps to run:

1. Build docker images

        docker-compose build

2. Spawn containers for redis, app and proxy

        docker-compose up

3. Run infastructure.js to listen to new container spawn requests

        node infastructure.js

## Docker Deploy

Steps to run:

1. Setup the folder structure as per the deployment workshop.

2. In the post-receive hook for the green and blue deployments commands are inserted to pull from registery, stop, and restart containers.

3. To push run the below commands depending on blue or green slice.

 * For blue
 
           git push blue master

    Visit http://localhost:5050 to test

  * For green
  
           git push green master

     Visit http://localhost:6050 to test
     
## File IO (Bonus)

Legacy Container: Contains the file which needs to be accessed. We have used socat to map file access to read file container and exposed over port 9001.

Linked Container: The container which accesses the file over the network using curl command on port 9001.
 
 Steps to run:

1. Build docker images

        docker-compose build

2. Spawn containers for legacy and linked containers to see the value in the file.

        docker-compose up


### Screencast: https://youtu.be/g2Ktrxw3Tzk




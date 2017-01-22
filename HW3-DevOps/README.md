# HW3-DevOps
Proxies, Queues, Cache Fluency

#### Name : Rohit Kishore Ahuja
#### Unity ID : rahuja

##Steps to Execute

1. Clone the repository
2. Run npm install to get the dependencies
3. Run node main.js to start the app server and node proxy.js to start the proxy server
4. Open the browser and visit http://localhost:8081

Proxy Server is running on http://localhost:8081 and default App Server is running on http://localhost:3000

##Routes
* http://localhost:8081/set/\message\ : Set the message in the redis database.
* http://localhost:8081/get : Retreive the message
* http://localhost:8081/recent : Returns the last 5 URLs visited
* http://localhost:8081/spawn : Spawns a new app server running on another port
* http://localhost:8081/listservers : Returns a list of app servers which are currently running
* http://localhost:8081/destroy : Removes a random app server from the redis list

Screencast : https://www.youtube.com/watch?v=jQ-4f45tnE4

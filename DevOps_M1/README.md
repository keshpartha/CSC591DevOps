# DevOps Milestone 1

<hr/>

## Team Members & Contribution
1. Nikunj Shah - nmshah5 (Objective 1,4,5 as described in Build Section)
2. Rohit Ahuja - rahuja (Objective 2,4,5 as described in Build Section)
3. Kartikeya Pharasi - kpharas (Objective 3,4,5 as described in Build Section)

<hr/>

## Build Section

As a part of this milestone, we have created a build server using the **Jenkins** tool that supports the following properties. We hosted the build server on a DigitalOcean droplet image. We have used a simple demonstration application called GameOfLife to demonstrate the build. We forked this application from https://github.com/wakaleo/game-of-life.

* **The ability to trigger a build in response to a git commit via a git hook.**

   We have configured a **webhook** in our github repo and configured the same with the Jenkins URL.

![alt tag](https://github.ncsu.edu/nmshah5/DevOps_M1/blob/master/Jenkins_Webhook.png)

* **The ability to execute a build job via a script or build manager (e.g., shell, maven), which ensures a clean build each time.**

   The GameOfLife project contains a pom.xml file and by running the **mvn package** command using the shell we can build the project.

![alt tag](https://github.ncsu.edu/nmshah5/DevOps_M1/blob/master/Jenkins_Maven.png)

* **The ability to determine failure or success of a build job, and as a result trigger an external event (run post-build task, send email, etc).**
  
   We have confugred Jenkins to send an email containing the build log to team members everytime a build completes. We have used the Jenkins plugin called **Email Extension Plugin** to achieve the same. The email is sent for success, failure as well as when the build status changes.

![alt tag](https://github.ncsu.edu/nmshah5/DevOps_M1/blob/master/Jenkins_Email.png)

* **The ability to have multiple jobs corresponding to multiple branches in a repository. Specifically, a commit to a branch, release, will trigger a release build job. A commit to a branch, dev, will trigger a dev build job.**
   
   We have demonstrated the same using 2 branches, **master** and **release**. We have configured 2 seperate jobs, **gameoflife-master** and **gameoflife-release** that get triggered by git hooks to achieve the same.

![alt tag](https://github.ncsu.edu/nmshah5/DevOps_M1/blob/master/Jenkins_Jobs.png)

* **The ability to track and display a history of past builds (a simple list works) via http.**
   
   Jenkins provides a display page for the build history.

![alt tag](https://github.ncsu.edu/nmshah5/DevOps_M1/blob/master/Jenkins_Build_History.png)

<hr/>

####Link to the screencast: https://www.youtube.com/watch?v=BPsUxOy7p0c

<hr/>

####Link to the GameOfLife Application Code (forked): https://github.com/nikunj91/game-of-life

# DevOps Milestone 2

<hr/>

## Team Members
1. Nikunj Shah - nmshah5
2. Rohit Ahuja - rahuja
3. Kartikeya Pharasi - kpharas

<hr/>

## Implementation Section

<hr/>

###A. System Under Test : Open source project with a test suite

We have taken a Nodejs open source project called ['SimpleSets'](https://github.com/PeterScott/simplesets-nodejs).
The project provides a set data type, with an API very close to that of Python's sets module.
The project already has some decent amount of test cases, over which we will generate our own using fuzzying teachniques

<hr/>

###B. Test section

####1. Test Suites : Ability to run unit tests, measure coverage, and report the results

The project already has some decent amount of test cases. We have used the belew tools to achieve the objective of this section
#####i.   [Mocha](https://www.npmjs.com/package/mocha) - Run the test cases
#####ii.  [Istanbul](http://gotwarlost.github.io/istanbul/) - Measure the coverage. 
#####iii. [Cobertura](https://wiki.jenkins-ci.org/display/JENKINS/Cobertura+Plugin) - Uses the istanbul report to report the results on Jenkins. 

![alt text](https://github.ncsu.edu/kpharas/DevOpsM2/blob/master/images/RunningUnitTests.png)
![alt text](https://github.ncsu.edu/kpharas/DevOpsM2/blob/master/images/TestSuites.png)

####2. Advanced Testing : Implement one of the following advanced testing techniques

We have [implemented](https://github.ncsu.edu/kpharas/DevOpsM2/blob/master/fuzzer.js) generative black-box fuzzing as a part of advance testing. The test input is randomly created for each of the methods in the project. The result is the addition of approximate 10k testcases, thus fulfilling the objective of this section.

![alt text](https://github.ncsu.edu/kpharas/DevOpsM2/blob/master/images/FuzzingReport.png)

<hr/>

###C. Analysis section

####1. Basic Analysis : Ability to run an existing static analysis tool on the source code

We have used [JSHint](http://jshint.com/) to perform the static code analysis and detect errors and potential problems in JavaScript code. 

![alt text](https://github.ncsu.edu/kpharas/DevOpsM2/blob/master/images/BasicAnalysis.png)

####2. Custom Metrics : Ability to implement your own custom source metrics

We have [implemented](https://github.ncsu.edu/kpharas/DevOpsM2/blob/master/analysis.js) the below custom metrics:
#####i.   Max condition: Count the max number of conditions within an if statement in a function
#####ii.  Long method: Detect a long methods. 
For demonstration purposes, our implementation assumes a function of size more than 6 lines as long. However the same can be differently configured easily.
#####iii. Free-style: Implement any analysis, such as security-token detection. 
We have implemented the detection of .pem files as well as AWS, Digital Ocean security token detection. 
#####iv.  BONUS: Detect duplicate code using an AST-based difference algorithm. 
We have check for duplicate code wherein the function will be flagged duplicate if it has the same body as another function. We have used Epsrima to generate AST for each function and then compared the AST amongst themselves to check for a match. We infact encountered a couple of such duplicate functions in our code.
NOTE : We have commited a seperated file [analysis_bonus.js](https://github.ncsu.edu/kpharas/DevOpsM2/blob/master/analysis_bonus.js) where the bonus part is implemented. To test it, you can run 
```
node analysis_bonus.js
```

![alt text](https://github.ncsu.edu/kpharas/DevOpsM2/blob/master/images/AdvancedAnalysis.png)
![alt text](https://github.ncsu.edu/kpharas/DevOpsM2/blob/master/images/AdvancedAnalysisNew.png)

<hr/>

###D. Handling of minimum testing criteria

We have used [post-commit scripts](https://github.ncsu.edu/kpharas/DevOpsM2/blob/master/post-commit) to ensure that a commit is rejected when either one of the below occurs
#####i.  High severity issue detected by JSHint
#####ii. Branch coverage is less than 80%
In additon to the commit being reject and project not being built, the changed files are again moved to the staging area.
If both criteria are met, then the project gets built in Jenkins.

<hr/>

##E. Screencast : https://www.youtube.com/watch?v=8rnYMJwqkVg
##   Bonus : https://www.youtube.com/watch?v=gagNmvvzYFc

<hr/>

## Steps to run

1. Clone the repository
```
git clone https://github.ncsu.edu/kpharas/DevOpsM2.git
```
2. Install Dependencies
```
npm install
``` 
3. Make sure python is installed in the system
4. Move the post-commit file to the .git/hooks folder
5. Start Jenkins and import the [job configuration file](https://github.ncsu.edu/kpharas/DevOpsM2/blob/master/M2DevOps.xml)
```
java -jar jenkins-cli.jar -s http://server create-job DevOpsM2 < M2DevOps.xml
```
5. Make appropriate apprioriate changes in the code and commit the same to run the pipeline.


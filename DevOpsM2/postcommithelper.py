#!/usr/bin/env python

import xml.etree.ElementTree as ET
import subprocess

tree_jshint = ET.parse('jshint.xml')
tree_cobertura = ET.parse('./coverage/cobertura-coverage.xml')
root_jshint = tree_jshint.getroot()
root_cobertura = tree_cobertura.getroot();

threshold = 0.9

flag_jshint = True;
flag_cobertura = True;

for child in root_jshint.findall('file'): 
	for issue in child.findall('issue'):
		if(issue.get('severity')=='E'):
			flag_jshint = False; 

if(float(root_cobertura.get('branch-rate')) < 0.8):
	flag_cobertura = False;


if(not(flag_jshint)):
	print "Cannot proceed with commit as the severity of one or more issues is High."
	subprocess.call(["git","reset","--soft" ,"HEAD^"]);
elif(not(flag_cobertura)):
	print "Cannot proceed as branch coverage is less than " + str(threshold*100) + "%";
	subprocess.call(["git","reset","--soft" ,"HEAD^"]);
else:
	subprocess.call(["curl", "http://localhost:8080/job/DevOpsM2/build?token=build"]);
	print "Build has been triggered successfully!";


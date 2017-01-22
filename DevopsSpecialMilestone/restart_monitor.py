import psutil
import math
import os
import time
import json
import redis
from urllib2 import urlopen
# from ansible.playbook import PlayBook
# from ansible.inventory import Inventory
# from ansible import callbacks
# from ansible import utils
from subprocess import call

import jinja2
from tempfile import NamedTemporaryFile
import os

with open('/etc/keys/redis.json') as json_data:
	redis_details = json.load(json_data)

r = redis.StrictRedis(host=redis_details['redisIp'], port=6379, db=0)

threshold = 80

# Boilerplace callbacks for stdout/stderr and log output
# utils.VERBOSITY = 0
# playbook_cb = callbacks.PlaybookCallbacks(verbose=utils.VERBOSITY)
# stats = callbacks.AggregateStats()
# runner_cb = callbacks.PlaybookRunnerCallbacks(stats, verbose=utils.VERBOSITY)

while True:
  no_of_servers = r.llen('servers')
  list_of_servers = r.lrange('servers', 0, no_of_servers)

  for i in range(0, no_of_servers):
  	server_ip = list_of_servers[i][7:-5]
  	server_dict = r.hgetall(server_ip)

  	print server_ip;
  	print server_dict;

  	if float(server_dict['cpuUsage']) > threshold or (time.time() - 90) > float(server_dict['timestamp']):
  		if no_of_servers == 1:
			 call(["ansible-playbook", "./ansible/new_droplet_setup.yml"])
  		  

  		r.lrem('servers', 0, list_of_servers[i])
  		inventory = "[AppServer]\nAppServer ansible_ssh_host=" + server_ip+ " ansible_ssh_user=root"

		f=open('inventoryApp', 'w')
     		f.write(inventory)
     		f.close()

     		call(["ansible-playbook", "./ansible/stopservices.yaml", "-i", "inventoryApp"])
     		call(["ansible-playbook", "./ansible/restartservices.yaml", "-i", "inventoryApp"])

  # 		inventory_template = jinja2.Template(inventory)
		# rendered_inventory = inventory_template.render({'ssh_host': server_ip})

		# hosts = NamedTemporaryFile(delete=False)
		# hosts.write(rendered_inventory)
		# hosts.close()

		# pb_stop = PlayBook(playbook='./ansible/stopservices.yaml', host_list=hosts.name, callbacks=playbook_cb, runner_callbacks=runner_cb, stats=stats)
		# pb_start = PlayBook(playbook='./ansible/restartservices.yaml', host_list=hosts.name, callbacks=playbook_cb, runner_callbacks=runner_cb, stats=stats)

		# pb_stop.run()
		# pb_start.run()

  time.sleep(60.0)


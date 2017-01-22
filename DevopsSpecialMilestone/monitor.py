import psutil
import math
import os
import time
import json
import redis
from urllib2 import urlopen

with open('/etc/keys/redis.json') as json_data:
	redis_details = json.load(json_data)

r = redis.StrictRedis(host=redis_details['redisIp'], port=6379, db=0)

ipAddress = urlopen('http://ip.42.pl/raw').read()

while True:
  r.hmset(ipAddress, {'timestamp': time.time(), 'cpuUsage': psutil.cpu_percent(interval=1)})
  print(r.hgetall(ipAddress))
  time.sleep(30.0)

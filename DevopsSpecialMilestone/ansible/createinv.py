import json
import redis
from urllib2 import urlopen

with open('/etc/keys/redis.json') as json_data:
	redis_details = json.load(json_data)

r = redis.StrictRedis(host=redis_details['redisIp'], port=6379, db=0)

ipAddress = urlopen('http://ip.42.pl/raw').read()

applist = r.lrange('servers',0,r.llen('servers'))
proxylist = r.lrange('proxyservers',0,r.llen('proxyservers'))

file = open("restartInventory", "w")
str = ""
if len(applist):
	str += "[AppServer]\n"
for app in applist:
	app=app.lstrip('http://')
	app=app[:app.find(':')]
	str+=app+" ansible_ssh_host="+app+" ansible_ssh_user=root\n"
if len(proxylist):
	str += "[ProxyServer]\n"
for proxy in proxylist:
	proxy=proxy.lstrip('http://')
	proxy=proxy[:proxy.find(':')]
	str+=proxy+" ansible_ssh_host="+proxy+" ansible_ssh_user=root\n"
str+="[RedisServer]\n"+redis_details['redisIp']+" ansible_ssh_host="+redis_details['redisIp']+" ansible_ssh_user=root\n"
file.write(str)
file.close()

r.delete('servers')
r.delete('proxyservers')

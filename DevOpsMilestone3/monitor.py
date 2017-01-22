import psutil
import math
import os
import time
import json

from twilio.rest import TwilioRestClient

keys={};

with open('/etc/keys/keys.json') as json_data:
    keys = json.load(json_data)

account = keys['twilioAccountKey'];
token = keys['twilioAPIKey']
fromNumber = keys['twilioFromNumber'];
toNumber = keys['twilioToNumber'];

client = TwilioRestClient(account, token)

while True:
	if psutil.cpu_percent(interval=1)>50:#os.system('echo "The system-wide CPU utilization is "' + str(psutil.cpu_percent(interval=1)) + ' | mail -s "High System-wide CPU utilization" rahuja@ncsu.edu')
		message = client.sms.messages.create(to=toNumber, from_=fromNumber, body="The system-wide CPU utilization is " + str(psutil.cpu_percent(interval=1)))

	if psutil.virtual_memory().percent>50:#os.system('echo "The system memory usage is "' + str(psutil.virtual_memory().percent) + ' | mail -s "High System Memory Usage" rahuja@ncsu.edu')
		message = client.sms.messages.create(to=toNumber, from_=fromNumber, body="The system memory usage is " + str(psutil.virtual_memory().percent))
	time.sleep(10)

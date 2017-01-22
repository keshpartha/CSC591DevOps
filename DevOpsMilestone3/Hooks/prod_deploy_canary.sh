#!/bin/sh
ansible-playbook /src/ansible/prod-deploy-canary.yml -i /src/ansible/inventory

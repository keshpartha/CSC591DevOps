#!/bin/bash

python createinv.py
ansible-playbook ./stopservices.yaml -i ./restartInventory
ansible-playbook ./restartservices.yaml -i ./restartInventory

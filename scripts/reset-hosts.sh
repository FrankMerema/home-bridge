#!/bin/sh

source $(dirname $0)/init_mongo_vars.sh

mongo --quiet ${mongoUri}/${mongoDatabase} $(dirname $0)/reset-hosts.js

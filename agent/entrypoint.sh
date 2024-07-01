#!/bin/bash

/app/tests/testAgent.sh
cd /app/data/ && unzip logs_proxy_format.log.zip
cd /app
exec "$@"
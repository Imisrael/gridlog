#!/bin/bash

/app/tests/createConfig.sh
/app/tests/createLogFiles.sh

exec "$@"
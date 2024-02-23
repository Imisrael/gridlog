#!/bin/bash

while /bin/true; do
  DATE=$(date)
  echo $DATE $HOSTNAME $LOGGING_TYPE demo
  sleep $1
done
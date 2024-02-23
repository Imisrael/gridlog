#!/bin/bash

while /bin/true; do
  DATE=$(date)
  echo $DATE $HOSTNAME random log entry
  sleep $1
done
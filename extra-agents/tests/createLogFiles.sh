#!/bin/bash

./tests/createLog.sh 1 > log.txt &
cl_pid=$!
echo $cl_pid &
java -jar target/Agent.jar &
la_pid=$!
echo $la_pid &
sleep 10 && kill $cl_pid && kill $la_pid &
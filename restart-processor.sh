#!/bin/bash

docker compose down log-processor
docker compose build log-processor
docker compose up -d log-processor
docker logs -f log-processor
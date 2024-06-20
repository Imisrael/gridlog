# Git Submodule (Web API)

to pull in the web api, please run the following: 

1. git submodule init
2. git submodule update

# Running Program

1. docker compose build
2. docker compose up -d --force-recreate

If GridDB fails to start, many of the containers won't either. Just run `docker compose up` again

## Test

1. cd agent
2. ./tests/runTestInDocker.sh
3. ./tests/readGridDBContainer.sh


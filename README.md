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

## Running Many Demo Agent hosts

- You can run this without running any of the above. It will start the GridDB server and the web api before running the demos and their tests
- You can also run this while the rest of the containers are runningw

1. docker compose up agent_demo_1 agent_demo_2 agent_demo_3 agent_demo_4 --force-recreate

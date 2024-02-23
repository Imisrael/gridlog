#!/bin/bash

echo "LOGGING TYPE="$LOGGING_TYPE

cat << EOT > ./conf/logs.json
{ 
  "logs": [
    {
      "type":"$LOGGING_TYPE",
      "path": "log.txt",
      "interval": 1000
    }
  ]
}
EOT
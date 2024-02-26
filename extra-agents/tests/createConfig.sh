#!/bin/bash

echo "LOGGING TYPE="$LOGGING_TYPE

cat << EOT > ./conf/logs.json
{ 
  "logs": [
    {
      "type":"tests",
      "path": "log.txt",
      "interval": 1000,
      "columns": [
        {"name": "log", "type": "STRING"  }
      ]
    }
  ]
}

EOT
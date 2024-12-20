import * as React from 'react';
import { NewLogEntryInputs } from '../utils/types';

import { Button } from "flowbite-react";

export default function ManagedLogTypes(props:
  {
    setExampleLogEntry: React.Dispatch<React.SetStateAction<NewLogEntryInputs>>;
  }
) {
  const { setExampleLogEntry } = props;

  const testsLogType: NewLogEntryInputs = {
    logtype: "tests",
    // eslint-disable-next-line no-useless-escape
    regex_format: String.raw`([\w]+\s[\w]+\s[\d]+\s[\d:]+\s[\w]+\s[\w]+\s[\w]+)\s([\w]+)\s(.+)`,
    timestamp_position: 1,
    entry_sample: "Thu Aug 17 01:19:05 AM UTC 2023",
    timestamp_format: "EEE MMM d hh:mm:ss a z YYYY",
    file_path: "log-half-second.txt",
    interval: 1000,
    expiration_time: 5,
    partition_unit: 'DAY',
    schema: ["timestamp,timestamp,hostname,string,log,string"],
    schemaObj: {
      columnNames: ['timestamp', 'hostname', 'log'],
      columnTypes: [
        { value: 'timestamp' },
        { value: 'string' },
        { value: 'string' }
      ]
    }
  }

  const serverLogType: NewLogEntryInputs = {
    logtype: "server",
    // eslint-disable-next-line no-useless-escape
    regex_format: String.raw`^\[([^\]]+)\] (\d{3}) - (\w+) (\w+) (.*?) ([^\"]+) \[Client (\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})\] \[Length (\d+)\] \[Gzip (\d+\.\d+)\] (.*?) (.*?)`,
    timestamp_position: 1,
    entry_sample: "[08/Jan/2024:22:38:20 +0000] 404 - GET http illegalthoughts.duckdns.org /telescope/requests [Client 134.122.89.242] [Length 122] [Gzip 1.35] Go-http-client/1.1 -",
    timestamp_format: "d/MMM/YYYY:HH:mm:ss Z",
    file_path: "/nginx/logs/fallback_access.log",
    interval: 2000,
    expiration_time: 10,
    partition_unit: 'DAY',
    schema: ["timestamp,timestamp,statusCode,integer,httpMethod,string,httpProtocol,string,hostname,string,requestedURL,string,clientIP,string,contentLength,integer,gzip,string,userAgent,string"],
    schemaObj: {
      columnNames: ['timestamp', 'statusCode', 'httpMethod', 'httpProtocol', 'hostname', 'requestedURL', 'clientIP', 'contentLength', 'gzip', 'userAgent'],
      columnTypes: [
        { value: 'timestamp' },
        { value: 'integer' },
        { value: 'string' },
        { value: 'string' },
        { value: 'string' },
        { value: 'string' },
        { value: 'string' },
        { value: 'integer' },
        { value: 'string' },
        { value: 'string' }
      ]
    }
  }

  const intrusionLogType: NewLogEntryInputs = {
    logtype: "httpML",
    regex_format: String.raw`^\[([^\]]+)\] (\w+ \w+|\w+) (\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}) (\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}) ([0-9]+) ([0-9]+) (\w+) (\w+) ((https?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*(?:;[0-9])?+)) (HTTP/[0-9]*\.[0-9]+) (\w+ \w+|\w+) (\w+ \w+ )((?:[A-Za-z]+/[A-Za-z]+;?)(?: [A-Za-z]+=[A-Za-z0-9]+-[A-Za-z0-9]+)?+(?:-[A-Za-z0-9]+)?(?:-[A-Za-z0-9]+)?) ([0-9]+) ([0-9]+) ((?:[^\\\"]|\\\\|\\\")*) ((https?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)|\w+\/[0-9]+\.[0-9]+\.[0-9]+_[0-9]+?) (.?) (.?) (.?) ((?:True|False)) ((?:Set|Inferred))`,
    timestamp_position: 1,
    entry_sample: `[04/Jun/2014:00:15:02 -0700] Nico Rosberg 192.168.204.228 213.5.176.14 1500 200 TCP_HIT GET http://www.johnknightglass.co.uk/images/bifold-doors-uk.jpg HTTP/1.1 Internet Services low risk image/jpeg 648 937 Mozilla/4.0 (compatible; MSIE 8.0; Windows NT 6.1; Trident/4.0; SLCC2; .NET CLR 2.0.50727; .NET CLR 3.5.30729; .NET CLR 3.0.30729) http://www.johnknightglass.co.uk/ - 0 -`,
    timestamp_format: "d/MMM/yyyy:HH:mm:ss Z",
    file_path: "/app/data/http.log",
    interval: 2000,
    expiration_time: 10000,
    partition_unit: 'DAY',
    schema: [],
    schemaObj: {
      columnNames: [
        'timestamp',
        'username',
        'incomingIP',
        'serverIP',
        'mtu',
        'statusCode',
        'cacheHit',
        'method',
        'url',
        'urlProtocol',
        'urlPrefix',
        'urlSuffix',
        'httpVersion',
        'service',
        'riskLevel',
        'mimeType',
        'bytesReceived',
        'bytesSent',
        'userAgent',
        'referrer',
        'refProtocol',
        'refPrefix',
        'refSuffix',
        'meta1',
        'meta2',
        'meta3',
        'exploit',
        'labelType',
      ],
      columnTypes: [
        { value: 'timestamp' },
        { value: 'string' },
        { value: 'string' },
        { value: 'string' },
        { value: 'integer' },
        { value: 'integer' },
        { value: 'string' },
        { value: 'string' },
        { value: 'string' },
        { value: 'string' },
        { value: 'string' },
        { value: 'string' },
        { value: 'string' },
        { value: 'string' },
        { value: 'string' },
        { value: 'string' },
        { value: 'integer' },
        { value: 'integer' },
        { value: 'string' },
        { value: 'string' },
        { value: 'string' },
        { value: 'string' },
        { value: 'string' },
        { value: 'string' },
        { value: 'string' },
        { value: 'string' },
        { value: 'bool' },
        { value: 'string' },
      ]
    }
  }

  const buttonHandler = (event: React.MouseEvent<HTMLButtonElement>) => {
    const type = event.currentTarget.getAttribute("data-logtype")
    if (type === "tests") {
      setExampleLogEntry(testsLogType);
    } else if (type === "server") {
      setExampleLogEntry(serverLogType);
    } else if (type === "intrusion") {
      setExampleLogEntry(intrusionLogType);
    }

  }

  return (
      <Button.Group outline>
        <Button
          color="gray"
          data-logtype="tests"
          onClick={buttonHandler}
        >
          Tests
        </Button>
        <Button
          color="gray"
          data-logtype="server"
          onClick={buttonHandler}
        >
          Server Logs
        </Button>
        <Button
          color="gray"
          data-logtype="intrusion"
          onClick={buttonHandler}
        >
          Intrusion Detection
        </Button>
      </Button.Group>

  )
}
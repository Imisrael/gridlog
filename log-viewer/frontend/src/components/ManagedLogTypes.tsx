import * as React from 'react';
import { NewLogEntryInputs } from '../utils/types';

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
    schemaArr: ["timestamp,timestamp,hostname,string,log,string"],
    schema: {
      columnNames: ['timestamp','hostname','log'],
      columnTypes: [
        {value: 'timestamp'},
        {value: 'string'},
        {value: 'string'}
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
    schemaArr: ["timestamp,timestamp,statusCode,integer,httpMethod,string,httpProtocol,string,hostname,string,requestedURL,string,clientIP,string,contentLength,integer,gzip,string,userAgent,string"],
    schema: {
      columnNames: ['timestamp','statusCode','httpMethod', 'httpProtocol', 'hostname', 'requestedURL', 'clientIP', 'contentLength', 'gzip', 'userAgent'],
      columnTypes: [
        {value: 'timestamp'},
        {value: 'integer'},
        {value: 'string'},
        {value: 'string'},
        {value: 'string'},
        {value: 'string'},
        {value: 'string'},
        {value: 'integer'},
        {value: 'string'},
        {value: 'string'}
      ]
    }
  }

  const intrusionLogType: NewLogEntryInputs = {
    logtype: "intrusion_benign",
    regex_format: String.raw`^\[([^\]]+)\] (\w+ \w+|\w+) (\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}) (\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}) ([0-9]+) ([0-9]+) (\w+) (\w+) ((https?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)) (HTTP/[0-9]*\.[0-9]+) (\w+ \w+|\w+) (\w+ \w+ )([A-Za-z]+/[A-Za-z]+) ([0-9]+) ([0-9]+) ((?:[^\\\"]|\\\\|\\\")*) ((https?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)) (.?) (.?) (.?)`,
    timestamp_position: 1,
    entry_sample: `[04/Jun/2014:00:15:02 -0700] Nico Rosberg 192.168.204.228 213.5.176.14 1500 200 TCP_HIT GET http://www.johnknightglass.co.uk/images/bifold-doors-uk.jpg HTTP/1.1 Internet Services low risk image/jpeg 648 937 Mozilla/4.0 (compatible; MSIE 8.0; Windows NT 6.1; Trident/4.0; SLCC2; .NET CLR 2.0.50727; .NET CLR 3.5.30729; .NET CLR 3.0.30729) http://www.johnknightglass.co.uk/ - 0 -`,
    timestamp_format: "d/MMM/yyyy:HH:mm:ss Z",
    file_path: "/app/data/logs_proxy_format_benign.log",
    interval: 2000,
    expiration_time: 10000,
    partition_unit: 'DAY',
    schemaArr: [],
    schema: {
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
        'url2',
        'url2Protocol',
        'url2Prefix',
        'url2Suffix',
        'meta1',
        'meta2',
        'meta3',
      ],
      columnTypes: [
        {value: 'timestamp'},
        {value: 'string'},
        {value: 'string'},
        {value: 'string'},
        {value: 'integer'},
        {value: 'integer'},
        {value: 'string'},
        {value: 'string'},
        {value: 'string'},
        {value: 'string'},
        {value: 'string'},
        {value: 'string'},
        {value: 'string'},
        {value: 'string'},
        {value: 'string'},
        {value: 'string'},
        {value: 'integer'},
        {value: 'integer'},
        {value: 'string'},
        {value: 'string'},
        {value: 'string'},
        {value: 'string'},
        {value: 'string'},
        {value: 'string'},
        {value: 'string'},
        {value: 'string'},
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
  const buttonStyle= "text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"

  return (
    <>
      <button className={buttonStyle}
        data-logtype="tests"
        onClick={buttonHandler}
      >
        Tests
      </button>
      <button className={buttonStyle}
        data-logtype="server"
        onClick={buttonHandler}
      >
        Server</button>
        <button className={buttonStyle}
        data-logtype="intrusion"
        onClick={buttonHandler}
      >
        Intrusion</button>
    </>
  )
}
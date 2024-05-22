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
    partition_unit: 10,
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
    partition_unit: 5,
    schemaArr: ["timestamp,timestamp,statusCode,integer,httpMethod,string,httpProtocol,string,hostname,string,requestedURL,string,clientIP,string,contentLength,integer,gzip,string,userAgent,string"]
  }

  const buttonHandler = (event: React.MouseEvent<HTMLButtonElement>) => {
    const type = event.currentTarget.getAttribute("data-logtype")
    if (type === "tests") {
      setExampleLogEntry(testsLogType);
    } else if (type === "server") {
      setExampleLogEntry(serverLogType);
    }

  }

  return (
    <>
      <button className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
        data-logtype="tests"
        onClick={buttonHandler}
      >
        Tests
      </button>
      <button className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
        data-logtype="server"
        onClick={buttonHandler}
      >
        Server</button>
    </>
  )
}
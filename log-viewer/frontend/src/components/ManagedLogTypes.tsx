import * as React from 'react';
import { NewLogEntryInputs } from '../utils/types';

export default function ManagedLogTypes (props: 
  {
    setExampleLogEntry:  React.Dispatch<React.SetStateAction<NewLogEntryInputs>>;
  }
) {
  const {setExampleLogEntry} = props;

  const testsLogType: NewLogEntryInputs = {
    logtype: "tests",
    // eslint-disable-next-line no-useless-escape
    regex_format: "([\w]+\s[\w]+\s[\d]+\s[\d:]+\s[\w]+\s[\w]+\s[\w]+)\s([\w]+)\s(.+)",
    timestamp_position: 1,
    entry_sample: "Thu Aug 17 01:19:05 AM UTC 2023",
    timestamp_format: "EEE MMM d hh:mm:ss a z YYYY",
    file_path: "log-half-second.txt",
    interval: 1000,
    expiration_time: 5,
    partition_unit: 10,
    schema: "timestamp,timestamp,hostname,string,log,string"
  }

  const buttonHandler = () => {
    console.log(testsLogType);
    setExampleLogEntry(testsLogType);
  }

    return (
        <>
            <button onClick={buttonHandler}>
              Tests
            </button>
        </>
    )
}
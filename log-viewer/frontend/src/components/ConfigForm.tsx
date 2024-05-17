import * as React from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { HOST } from "../utils/constants";
import { NewLogEntryInputs } from "../utils/types";

// "logtype": "tests",
// "SAMPLE": "Thu 17 Aug 2023 01:41:49 PM PDT hpelnxdev random log entry",
// "format": "([\w]+\s[\w]+\s[\d]+\s[\d:]+\s[\w]+\s[\w]+\s[\w]+)\s([\w]+)\s(.+)",
// "timestamp_pos" : 1,
// "MYSAMPLE":          "Thu Aug 17 01:19:05 AM UTC 2023",
// "timestamp_format" : "EEE MMM d hh:mm:ss a z YYYY",
// "schema" : [
//     {"name": "timestamp", "type": "TIMESTAMP", "index": ["tree"]},
//     {"name": "hostname", "type": "STRING", "index": []},
//     {"name": "log", "type": "STRING", "index": []}
// ]
    // path
    // interval
    // expiration_time
    // partition_unit


export default function ConfigForm(props: {exampleLogEntry: NewLogEntryInputs}) {


  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<NewLogEntryInputs>()

  const {exampleLogEntry} = props;

  React.useEffect( () => {
    if (exampleLogEntry !== null) {
      setValue("logtype", exampleLogEntry.logtype);
      setValue("regex_format", exampleLogEntry.regex_format);
      setValue("timestamp_position", exampleLogEntry.timestamp_position);
      setValue("entry_sample", exampleLogEntry.entry_sample);
      setValue("timestamp_format", exampleLogEntry.timestamp_format);
      setValue("schema", exampleLogEntry.schema);
      setValue("file_path", exampleLogEntry.file_path);
      setValue("interval", exampleLogEntry.interval);
      setValue("expiration_time", exampleLogEntry.expiration_time);
      setValue("partition_unit", exampleLogEntry.partition_unit);
    }   
  }, [exampleLogEntry, setValue]);

  const onSubmit: SubmitHandler<NewLogEntryInputs> = (data) => {
    data.regex_format = String.raw`${data.regex_format}`;
    console.log(data)
    const schemaArr = data.schema.split(",");
    data["schemaArr"] = schemaArr;
    console.log("pushing data: ", data)
    let url = `${HOST}createConfig`
    fetch(url, {
      method: "POST",
      mode: "cors",
      cache: "no-cache",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    })
      .then(res => res.json())
      .then(
        result => console.log("result", result)
      )

  }
  // regex ensures `columnName,columnType` pattern
  const regex = /^(\w+(,\s*\w+)*)$/;

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input type="text" placeholder="logtype" {...register("logtype", {required: true})} />
      <input type="text" placeholder="regex_format" {...register("regex_format", {required: true})} />
      <input type="number" placeholder="timestamp position" {...register("timestamp_position", {required: true})} />
      <input type="text" placeholder="entry sample" {...register("entry_sample", {required: true})} />
      <input type="text" placeholder="timestamp format" {...register("timestamp_format", {required: true})} />
      <input type="text" placeholder="file path" {...register("file_path", {required: true})} />
      <input type="number" placeholder="interval" {...register("interval", {required: true})} />
      <input type="number" placeholder="expiration time" {...register("expiration_time", {required: true})} />
      <input type="number" placeholder="partition unit" {...register("partition_unit", {required: true})} />
      <textarea defaultValue="FORMAT: columnName,columnType" {...register("schema", {required: true, pattern: regex})} />
      {errors.schema && <p> The schema field requires a format of `name,type` with no spaces (for example: hostname,string,logtype,string,timestamp,timestamp)</p>}
      <input type="submit" />
    </form>
  )
}


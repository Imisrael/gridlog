import * as React from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { HOST } from "../utils/constants";

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

type Inputs = {
  logtype: string
  regex_format: string
  timestamp_position: number
  entry_sample: string
  timestamp_format: string
  schema: string
}




export default function App() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Inputs>()

  const onSubmit: SubmitHandler<Inputs> = (data) => {
    console.log(data)
    const schemaArr = data.schema.split(",");
    data["schemaArr"] = schemaArr;

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
  const regex = /^(\w+(,\s*\w+)*)$/;

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input type="text" placeholder="logtype" {...register("logtype", {required: true})} />
      <input type="text" placeholder="regex_format" {...register("regex_format", {required: true})} />
      <input type="number" placeholder="timestamp position" {...register("timestamp_position", {required: true})} />
      <input type="text" placeholder="entry sample" {...register("entry_sample", {required: true})} />
      <input type="text" placeholder="timestamp format" {...register("timestamp_format", {required: true})} />
      <textarea defaultValue="FORMAT: columnName,columnType" {...register("schema", {required: true, pattern: regex})} />
      {errors.schema && <p> The schema field requires a format of `name,type` with no spaces (for example: hostname,string,logtype,string,timestamp,timestamp)</p>}
      <input type="submit" />
    </form>
  )
}


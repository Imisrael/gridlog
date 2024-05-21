import * as React from "react";
import { useForm, SubmitHandler, FieldValues, FormProvider } from "react-hook-form";
import { HOST } from "../utils/constants";
import { NewLogEntryInputs } from "../utils/types";
import { Button } from 'semantic-ui-react';
import SelectForm from "../components/SelectForm.tsx";

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


export default function ConfigForm(props: { exampleLogEntry: NewLogEntryInputs, keyNames: string[] }) {

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    control,
    formState,
    formState: { isSubmitSuccessful, errors },
  } = useForm<FieldValues>()
  const methods = useForm();

  const [submittedData, setSubmittedData] = React.useState({});

  const { exampleLogEntry, keyNames } = props;

  function validateUniqueKeyName(key: string) {
    if (keyNames.length > 0 && keyNames !== null) {
      for (let i = 0; i < keyNames.length; i++) {
        if (key === keyNames[i]) {
          return false
        }
      }
      return true
    }
    return false;
  }

  // populates form with example data based on user input
  React.useEffect(() => {
    if (exampleLogEntry !== null) {
      setValue("logtype", exampleLogEntry.logtype);
      setValue("regex_format", exampleLogEntry.regex_format);
      setValue("timestamp_position", exampleLogEntry.timestamp_position);
      setValue("entry_sample", exampleLogEntry.entry_sample);
      setValue("timestamp_format", exampleLogEntry.timestamp_format);
      // setValue("schema", exampleLogEntry.schema);
      setValue("file_path", exampleLogEntry.file_path);
      setValue("interval", exampleLogEntry.interval);
      setValue("expiration_time", exampleLogEntry.expiration_time);
      setValue("partition_unit", exampleLogEntry.partition_unit);
    }
  }, [exampleLogEntry, setValue]);

  React.useEffect(() => {
    if (formState.isSubmitSuccessful) {
      reset(
        {
          logtype: "",
          regex_format: "",
          timestamp_position: 0,
          entry_sample: "",
          timestamp_format: "",
          schema: "",
          file_path: "",
          interval: 0,
          expiration_time: 0,
          partition_unit: 0,
        }
      )
    }
  }, [formState, submittedData, reset])


  const onSubmit: SubmitHandler<NewLogEntryInputs> = (data) => {
    if (data !== null) {
      data.regex_format = String.raw`${data.regex_format}`;
      const colNames = data.schema.columnNames.filter(name => name !== undefined)
      const colTypes = data.schema.columnTypes.filter(type => type !== undefined)
      data.schema.columnNames = colNames;
      data.schema.columnTypes = colTypes;
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
          result => {
            setSubmittedData(result)
            console.log("result", result)
          }

        )
    }


  }
  // regex ensures `columnName,columnType` pattern
  // const regex = /^(\w+(,\s*\w+)*)$/;

  const initialRows = [
    { idx: 1, numOfRows: 1, high: 1 },
  ]

  const [schemaRows, setSchemaRows] = React.useState(initialRows);
  const [numOfSchemaRows, setNumOfSchemaRows] = React.useState(1);
  const [lastRow, setLastRow] = React.useState(1);

  const removeRow = (idx: number) => {
    const newRows = schemaRows.filter((row) => row.idx !== idx)

    let max = 0;
    newRows.forEach(row => {
      let temp = Math.max(max, row.idx)
      max = temp;
    })
    setLastRow(max)
    setSchemaRows(newRows);
    setNumOfSchemaRows(newRows.length)
  }

  const addNumOfRows = (newNum: number) => {
    newNum++
    console.log("adding new row from addNumofRows: ", newNum);
    let rows = []
    let max = 1;
    for (let i = 1; i < newNum; i++) {
      rows.push({ idx: i, schemaRows: newNum })
      max = i
    }
    setLastRow(max);
    setSchemaRows(rows);
    setNumOfSchemaRows(rows.length)
  }



  return (
    <>

      <FormProvider {...methods}>

        <form onSubmit={handleSubmit(onSubmit)}>
          <input type="text" placeholder="logtype" {...register("logtype", { required: true, validate: (value) => validateUniqueKeyName(value) })} />
          <input type="text" placeholder="regex_format" {...register("regex_format", { required: true })} />
          <input type="number" placeholder="timestamp position" {...register("timestamp_position", { required: true })} />
          <input type="text" placeholder="entry sample" {...register("entry_sample", { required: true })} />
          <input type="text" placeholder="timestamp format" {...register("timestamp_format", { required: true })} />
          <input type="text" placeholder="file path" {...register("file_path", { required: true })} />
          <input type="number" placeholder="interval" {...register("interval", { required: true })} />
          <input type="number" placeholder="expiration time" {...register("expiration_time", { required: true })} />
          <input type="number" placeholder="partition unit" {...register("partition_unit", { required: true })} />
          {schemaRows.map(row => (
            <SelectForm
              key={row.idx}
              control={control}
              idx={row.idx}
              removeRow={removeRow}
              addNumOfRows={addNumOfRows}
              numOfSchemaRows={numOfSchemaRows}
              lastRow={lastRow}
            />
          ))}


          {errors.logtype && <p> Sorry, it looks like this keyName (logtype) is already being tracked and used!</p>}
          {errors.schema && <p> The schema field requires a format of `name,type` with no spaces (for example: hostname,string,logtype,string,timestamp,timestamp)</p>}
          <input type="submit" />
        </form>
      </FormProvider>
    </>

  )
}


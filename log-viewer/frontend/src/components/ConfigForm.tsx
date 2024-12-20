import * as React from "react";
import { useForm, SubmitHandler, FieldValues, FormProvider } from "react-hook-form";
import { HOST } from "../utils/constants";
import { NewLogEntryInputs } from "../utils/types";
import SelectForm from "../components/SelectForm.tsx";


const initialRows = [
  { idx: 1, numOfRows: 1, high: 1, value: [] },
]

export default function ConfigForm(props: { 
  exampleLogEntry: NewLogEntryInputs, 
  keyNames: string[],
  disableAddRemove: boolean
}) {

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

  const { exampleLogEntry, keyNames, disableAddRemove } = props;

  function validateUniqueKeyName(key: string) {
    if (keyNames.length > 0 && keyNames !== null) {
      for (let i = 0; i < keyNames.length; i++) {
        if (key === keyNames[i]) {
          return false
        }
      }
      return true
    }
    return true;
  }

  function genSchemaFromObj(
    colNames: string[],
    colTypes: { value: string, label?: string }[]
  ): string[] {
    //console.log("gen schema from obj: ", colNames, colTypes)
    if (colNames.length !== colTypes.length) {
      return []
    }
    let types = [];

    if (colTypes[0].value !== undefined) {
      colTypes.forEach(t => types.push(t.value))
    } else {
      types = colTypes
    }

    const schema = []
    for (let i = 0; i < colNames.length; i++) {
      schema.push(colNames[i])
      schema.push(types[i])
    }
    return schema;
  }


  const [schemaRows, setSchemaRows] = React.useState(initialRows);
  const [numOfSchemaRows, setNumOfSchemaRows] = React.useState(1);
  const [lastRow, setLastRow] = React.useState(1);
  const [rowsUpdated, setRowsUpdated] = React.useState(false);

  // populates form with example data based on user input
  React.useEffect(() => {
    if (exampleLogEntry !== null) {
      setValue("logtype", exampleLogEntry.logtype);
      setValue("regex_format", exampleLogEntry.regex_format);
      setValue("timestamp_position", exampleLogEntry.timestamp_position);
      setValue("entry_sample", exampleLogEntry.entry_sample);
      setValue("timestamp_format", exampleLogEntry.timestamp_format);
      setValue("file_path", exampleLogEntry.file_path);
      setValue("interval", exampleLogEntry.interval);
      setValue("expiration_time", exampleLogEntry.expiration_time);
      setValue("partition_unit", exampleLogEntry.partition_unit);

      const schema: string[] = genSchemaFromObj(exampleLogEntry.schemaObj.columnNames, exampleLogEntry.schemaObj.columnTypes);
   //   console.log("Schema arr in gen function", schema);
      // we take the length divded by two the array is in colname,coltype pairs
      const n = schema.length / 2
      addNumOfRows(n);


      if (schemaRows.length === n) {
        const copy = schemaRows;
        let k = 0;
        for (let i = 0; i < schema.length; i += 2) {
          copy[k].value[0] = schema[i];
          copy[k].value[1] = schema[i + 1];
          setValue("schema.columnNames." + k, schema[i]);
          setValue("schema.columnTypes." + k, schema[i + 1]);
          k++;
        }
        //    console.log("Schema rows to be pushed: ", copy)
        setSchemaRows(copy);


        return;
      }
    }
  }, [exampleLogEntry, schemaRows, setValue]);

  React.useEffect(() => {
    // only set rows updated to true once schemarows is updated
    // this prevents schema rows not updating with values properly
    if (schemaRows.length > 1) {
      setRowsUpdated(true);
    }

  }, [schemaRows])

  React.useEffect(() => {
    if (isSubmitSuccessful) {
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
          partition_unit: "",
        }
      )
      setSchemaRows(initialRows);
      setNumOfSchemaRows(1)
    }

  }, [formState, submittedData, reset, isSubmitSuccessful])


  const onSubmit: SubmitHandler<NewLogEntryInputs> = (data) => {
    if (data !== null) {
      data.regex_format = String.raw`${data.regex_format}`;
      data.schemaObj = data.schema

      console.log("Submitted data: ", data);
      // undefined array values come into play if a user makes a column row but doesn't use it
      // or if they make it and delete it... the undefined stays on the obj
      const colNames = data.schema.columnNames.filter(name => name !== undefined)
      const colTypes: { value: string, label?: string }[] = data.schemaObj.columnTypes.filter(type => type !== undefined)



      const schema: string[] = genSchemaFromObj(colNames, colTypes);
      data.schema = schema;
      console.log("pushing data: ", data, schema)
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
            if (result < 300) 
              alert("Successfully Submitted")
            else 
              alert("There was an issue submitted your config. Please try again")          }

        )
    }

  }

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
    let rows = []
    let max = 1;
    for (let i = 1; i < newNum; i++) {
      rows.push({ idx: i, numOfRows: newNum, value: [] })
      max = i
    }
    // console.log("Setting schema rows", rows);
    setLastRow(max);
    setSchemaRows(rows);
    setNumOfSchemaRows(rows.length)
  }


  return (
    <>

      <FormProvider {...methods}>

        <form onSubmit={handleSubmit(onSubmit)}>
          <input className="mb-5 rounded" type="text" placeholder="logtype" {...register("logtype", { required: true, validate: (value) => validateUniqueKeyName(value) })} />
          <textarea className="mb-5 rounded" placeholder="regex_format" {...register("regex_format", { required: true })} />
          <input className="mb-5 rounded" type="number" placeholder="timestamp position" {...register("timestamp_position", { required: true })} />
          <textarea className="mb-5 rounded" placeholder="entry sample" {...register("entry_sample", { required: true })} />
          <input className="mb-5 rounded" type="text" placeholder="timestamp format" {...register("timestamp_format", { required: true })} />
          <input className="mb-5 rounded" type="text" placeholder="file path" {...register("file_path", { required: true })} />
          <input className="mb-5 rounded" type="number" placeholder="interval" {...register("interval", { required: true })} />
          <input className="mb-5 rounded" type="number" placeholder="expiration time" {...register("expiration_time", { required: true })} />
          <input className="mb-5 rounded" type="text" placeholder="partition unit" {...register("partition_unit", { required: true })} />
          {schemaRows.map(row => (
            <SelectForm
              key={row.idx}
              control={control}
              idx={row.idx}
              value={row.value}
              removeRow={removeRow}
              addNumOfRows={addNumOfRows}
              numOfSchemaRows={numOfSchemaRows}
              lastRow={lastRow}
              rowsUpdated={rowsUpdated}
              disableAddRemove={disableAddRemove}
            />
          ))}


          {errors.logtype && <p> Sorry, it looks like this keyName (logtype) is already being tracked and used!</p>}
          <input 
            className="rounded-lg shadow-md text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:ring-green-300 font-medium text-lg px-5 py-2.5 me-2 mb-2 dark:bg-green-600 dark:hover:bg-green-700 focus:outline-none dark:focus:ring-green-800" 
            type="submit" 
          />

          
        </form>
      </FormProvider>
    </>

  )
}


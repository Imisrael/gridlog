import * as React from 'react';
import ReactSelect from 'react-select';
import { Button } from 'semantic-ui-react';
import { Controller, Control, FieldValues } from "react-hook-form";


const options = [
  { value: 'string', label: 'String' },
  { value: 'integer', label: 'Integer' },
  { value: 'timestamp', label: 'Timestamp' }
]

export default function SelectForm(props:
  {
    idx: number;
    control: Control<FieldValues>;
    // register: UseFormRegister<FieldValues>;
    removeRow: (idx: number) => void;
    addNumOfRows: (currNumOfRows: number) => void;
    numOfSchemaRows: number;
    lastRow: number;
    value?: string[];
    rowsUpdated: boolean
 //   setValue;
  }
) {
  const { 
    idx, 
    control, 
    removeRow,
    addNumOfRows,
    numOfSchemaRows,
    value,
    rowsUpdated,
//    setValue,
  } = props;

  const [inputColName, setInputColName] = React.useState("column name");
  const [inputColType, setInputColType] = React.useState({ value: 'type', label: 'Column Type' });

  const inputName = `schema.columnNames.${idx-1}`
  const dropdownName = `schema.columnTypes.${idx-1}`
 
  React.useEffect( () => {
    if (value.length > 0 ) {
 //     console.log("values per indeX: ", idx, value);
      setInputColName(value[0])
      const coltype = {value: value[1], label: value[1]}
      setInputColType(coltype)
  //    setValue(dropdownName, inputColType)
    } else {
      console.log("value is undefined")
    }

  }, [value, rowsUpdated, idx])



  const handleAdd = () => {
    console.log("Adding item: ", numOfSchemaRows)
    let n = numOfSchemaRows
    addNumOfRows(++n);
  }

  const handleRemove = () => {
    //  console.log("Removing item", props.index)
    removeRow(idx)
  }

  const handleInputChange = ( value) => {
    console.log("input changed: ", value)
 //   setInputColType(value.value)
  }

  const handleInputNameChange = (event) => {
    console.log("input changed: ",  event.target)
    //setInputColName(value)
  }


  return (

    <div className="container">
      <div className="flex flex-row">
        <div className="w-1/3">
        <Controller
            name={inputName}
            control={control}
            render={({ field }) => (
              <input
                type="text"
                {...field}
                placeholder="column name"
                value={inputColName}
                onChange={handleInputNameChange}
                
              />
            )}
          />
        </div>

        <div className="w-1/3">
          <Controller
            name={dropdownName}
            control={control}
            render={({ field }) => (
              <ReactSelect
                isClearable
                placeholder="column type"
                {...field}
                options={options}
                value={inputColType}
                onChange={handleInputChange}
              />
            )}
          />
        </div>
        <div className="w-1/3">
          <Button
            type="button"
            icon='plus'
            className="addButton"
            style={{ right: "-15px" }}
            onClick={handleAdd}
          />
          <Button
            type="button"
            icon='minus'
            className="removeButton"
            style={{ right: "-35px" }}
            disabled={numOfSchemaRows === 1 ? true : false}
            onClick={handleRemove}
          />
        </div>
      </div>


    </div>


  )
}
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
    value?: any;
  }
) {
  const { 
    idx, 
    control, 
    removeRow,
    addNumOfRows,
    numOfSchemaRows,
  } = props;
 

  const handleAdd = () => {
    console.log("Adding item: ", numOfSchemaRows)
    let n = numOfSchemaRows
    addNumOfRows(++n);
  }

  const handleRemove = () => {
    //  console.log("Removing item", props.index)
    removeRow(idx)
  }

  const inputName = `schema.columnNames.${idx-1}`
  const dropdownName = `schema.columnTypes.${idx-1}`

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
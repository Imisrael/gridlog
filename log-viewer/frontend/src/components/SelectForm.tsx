import * as React from 'react';
import ReactSelect from 'react-select';
import { Button } from "flowbite-react";
import { FaPlus, FaMinus } from "react-icons/fa";
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
    disableAddRemove: boolean
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
    disableAddRemove,
//    setValue,
  } = props;

  console.log("disable add remove: ", disableAddRemove);

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
   // console.log("input changed: ", value)
    setInputColType(value)
  }

  const handleInputNameChange = (event) => {
    //console.log("input changed: ",  event.target)
    setInputColName(event.target.value)
  }


  return (

    <div>
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
                styles={{
                  input: (baseStyles) => ({
                    ...baseStyles,
                    padding: 0,
                    margin: 0
                  }),
                }}
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
        <Button.Group outline aria-disabled>
        <Button
            type="button"
            className="addButton"
            style={{ right: "-15px" }}
            onClick={handleAdd}
            disabled={disableAddRemove}
          > 
            <FaPlus />
          </Button>
          <Button
            type="button"
            className="removeButton"
            style={{ right: "-15px" }}
            disabled={
              numOfSchemaRows === 1 ? true : false ||
              disableAddRemove
            }
            onClick={handleRemove}
          > 
          <FaMinus />
          </Button>
        </Button.Group>

        </div>
      </div>


    </div>


  )
}
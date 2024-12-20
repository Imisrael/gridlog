import * as React from 'react';
import { Dropdown, Grid, Button, Input } from 'semantic-ui-react';
import { interpolationOptions, operatorOption } from '../utils/constants.tsx';


const QueryBuilder = (props:
  {
    index: number;
    removeRow: (idx: number) => void;
    addNumOfRows: (currNumOfRows: number) => void;
    numOfRows: number;
    aggregation: boolean;
    lastRow: number;
    userSelectedContainer: string;
    columnOptions: {type?: any; key: string; text: string; value: string; }[];
    inputsToDisabled: boolean;
    selected: boolean;
    schema: {key: any}
    setInputsToDisabled: React.Dispatch<React.SetStateAction<boolean>>;
    sendQuery: (col: string, oper: string, val: string | number, idx: string | number, containerName: string, columnType: string) => void;
    setSelected: React.Dispatch<React.SetStateAction<boolean>>;
    setAggColumn: React.Dispatch<any>;
    setInterpolation: React.Dispatch<React.SetStateAction<string>>;
  }
) => {

  const [Columns, setColumns] = React.useState("");
  const [Values, setValues] = React.useState("");
  const [Operators, setOperators] = React.useState("");
  const [lockButton, setLockButton] = React.useState(<></>);

  const { index,
    lastRow,
    userSelectedContainer,
    columnOptions,
    inputsToDisabled,
    selected,
    schema
  } = props

  const [columnType, setColumnType] = React.useState(null)

  const typeMapper = (type) => {
    let inputType = "text"

    switch (type) {
      case "STRING":
        inputType = "text"
        break
      case "INTEGER":
        inputType = "number"
        break
      case "TIMESTAMP":
        inputType = "datetime-local"
        break
      default:
        inputType = "text"
    }
    return inputType
  }

  const handleColumnInput = (e, { value }) => {
    //   console.log("handle column ", value)
    setColumns(value)
    let type = ""

    for (const element of schema[userSelectedContainer]) {
      if (element.name === value) {
        type = element.type;
        break
      }
    }
    let inputType = typeMapper(type)
    setColumnType(inputType)
    props.setInputsToDisabled(false);
  };

  const handleValue = (e, { value }) => {
    //  console.log("handle value ", value)
    if (columnType === "datetime-local") {
      let msTime = new Date(value).getTime();
      let queryStr = "TO_TIMESTAMP_MS(" + msTime + ")"
      setValues(queryStr)
      return
    }
    setValues(value)
    props.sendQuery(Columns, Operators, Values, index, userSelectedContainer, columnType)
  };

  const handleOperator = (e, { value }) => {
    //console.log("handle operator", value)
    setOperators(value)
  }

  const handleRemove = () => {
    //  console.log("Removing item", props.index)
    props.setSelected(false)
    props.removeRow(props.index)
  }
  const handleAdd = () => {
    // console.log("Adding item", props.numOfRows)
    props.setSelected(false)
    props.addNumOfRows(++props.numOfRows);
  }


  const activateSelection = React.useCallback(() => {
    props.setSelected(!selected)

    const dropdowns = document.querySelectorAll<HTMLElement>(".query-dropdown");

    const activeSelection = "2px solid gold"
    for (let item of dropdowns) {
      if (!selected)
        item.style.border = activeSelection
      else
        item.style.border = "none"
    }



    props.sendQuery(Columns, Operators, Values, index, userSelectedContainer, columnType)
  }, [Columns, Operators, Values, columnType, index, props, selected, userSelectedContainer])

  const handleAggSelector = (e, { value }) => {
    props.setAggColumn(value)
  }

  const handleInterpolation = (e, { value }) => {
    props.setInterpolation(value)
  }

  React.useEffect(() => {
    if (index === lastRow && !props.aggregation) {
      setLockButton(
        <Button
          icon='lock'
          className="lockSelection"
          color="green"
          style={{ right: "-5px" }}
          onClick={activateSelection}
          disabled={inputsToDisabled}
        />
      )
    } else {
      setLockButton(<></>);
    }

  }, [props.numOfRows, props.aggregation, index, inputsToDisabled, activateSelection, lastRow])

  return (
    <>

      <div>
        <Grid columns={5} centered padded>
          <Grid.Row>
            <Grid.Column>
              <Dropdown
                placeholder="Column"
                name="Column"
                fluid
                selection
                search
                className="query-dropdown"
                options={columnOptions}
                onChange={handleColumnInput}
                disabled={inputsToDisabled}
              />
            </Grid.Column>
            <Grid.Column>
              <Dropdown
                placeholder="Operator"
                name="operator"
                fluid
                selection
                className="query-dropdown"
                options={operatorOption}
                onChange={handleOperator}
                disabled={inputsToDisabled}
              />
            </Grid.Column>
            <Grid.Column>
              <Input
                placeholder='Input Search Value...'
                className="query-dropdown"
                onChange={handleValue}
                disabled={inputsToDisabled}
                type={columnType}
              />
            </Grid.Column>

            <Grid.Column className='text-left'>
              {lockButton}
            </Grid.Column>

            {props.aggregation ? <></>
              :
              <Grid.Column>
                <Button
                  icon='plus'
                  className="addButton"
                  style={{ right: "-15px" }}
                  onClick={handleAdd}
                />
                <Button
                  icon='minus'
                  className="removeButton"
                  style={{ right: "-35px" }}
                  disabled={props.numOfRows === 1 ? true : false}
                  onClick={handleRemove}
                />
              </Grid.Column>

            }


          </Grid.Row>
          {props.aggregation ?
            <Grid.Row>
              <Grid.Column>
                <Dropdown
                  placeholder="Aggregation Column"
                  name="aggregation"
                  fluid
                  selection
                  options={columnOptions.filter(val => val.type.includes("INTEGER"))}
                  className="query-dropdown"
                  onChange={handleAggSelector}
                />
              </Grid.Column>
              <Grid.Column>
                <Dropdown
                  placeholder="Interpolation Method"
                  name="interpolation"
                  fluid
                  selection
                  options={interpolationOptions}
                  className="query-dropdown"
                  onChange={handleInterpolation}
                />
              </Grid.Column>
              <Grid.Column>
                <Button
                  icon='lock'
                  className="lockSelection"
                  color="green"
                  style={{ right: "-5px" }}
                  onClick={activateSelection}
                  disabled={inputsToDisabled}
                />
              </Grid.Column>
            </Grid.Row>
            :
            <></>
          }

        </Grid>
      </div>
    </>
  )

}

export default QueryBuilder
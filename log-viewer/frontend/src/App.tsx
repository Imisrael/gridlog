import * as React from 'react';

import { Link } from "react-router-dom";

import { RadioButtonContext } from './components/RadioButtonContext.tsx'
import { DateRangeContext } from './components/DateRangeContext.tsx';
import useDidMountEffect from './hooks/useDidMountEffect.tsx';

import {
  generateColumns,
  msToTime,
  extractHostname,
  extractLogType,
  extractContainerNameFromSchema
} from './utils/General.tsx';

import { HOST, emptyOptions, limitOptions } from './utils/constants.tsx';
import styles from "./components/styles.module.css";

import DataTableNonAgg from './components/DataTableNonAgg';
import TimePicker from './components/TimePicker.tsx'
import Sidebar from './components/Sidebar.tsx';
import QueryBuilder from './components/QueryBuilder.tsx';
import Chart from './components/Chart';
import DataTableAgg from './components/DataTableAgg';

import { Tabs } from 'flowbite-react';

import { Button, Dropdown } from 'semantic-ui-react'

const App = () => {
  const [error, setError] = React.useState(null);
  const [isLoaded, setIsLoaded] = React.useState(true);
  const [logData, setLogData] = React.useState(null);
  const [LogTypes, setLogTypes] = React.useState([]);
  const [Hostnames, setHostnames] = React.useState([]);
  const [userLimit, setUserLimit] = React.useState(100);


  React.useEffect(() => { document.body.style.backgroundColor = 'rgb(226 232 240)' }, [])

  React.useEffect(() => {
    console.log("getContainers: ", `${HOST}getContainers`)
    fetch(`${HOST}getContainers`)
      .then(res => res.json())
      .then(
        (result) => {
          const arrLogTypes = ["none"];
          const arrHostnames = ["none"];
          result.forEach((container: string) => {
            arrLogTypes.push(extractLogType(container))
            arrHostnames.push(extractHostname(container))
          })
          const uniqueHostnames = [...new Set(arrHostnames)];
          const uniqueLogTypes = [...new Set(arrLogTypes)]
          setHostnames(uniqueHostnames);
          setLogTypes(uniqueLogTypes)

        },
        (error) => {
          setError(error);
        }
      )
  }, [])

  const [schema, setSchema] = React.useState(null);
  const [headerNames, setHeaderNames] = React.useState(null);
  const [containersToBeShown, setContainersToBeShown] = React.useState([]);
  const [progressPending, setProgressPending] = React.useState(true);

  const queryGridDB = (hostname, logtype, range) => {
    setProgressPending(true);
    let start = range.start.valueOf();
    console.log("start: ", start)
    let end = range.end.valueOf();

    // if both Logype and Hostname are still none, do not fetch
    let queryStr = `${HOST}containersWithParameters?hostname=${hostname}&logtype=${logtype}&start=${start}&end=${end}`
    console.log(queryStr)

    fetch(queryStr)
      .then(res => res.json())
      .then(
        (result) => {
          console.log("results of getting hostname or logtypes: ", result)

          const keys = Object.keys(result);
          //   let contNames = keys.filter(word => word.includes("arr") && !word.includes("schema"));
          let contNames = keys.filter(word => !word.includes("schema") && !word.includes("arr"));

          let schemas = {}
          let schemaNames = keys.filter(word => word.includes("schema"));
          // populating the schemas obj with the data
          schemaNames.forEach(s => schemas[s] = result[s])
          
          const listOfHeaderNames = generateColumns(schemas);
          setHeaderNames(listOfHeaderNames);

          const rawSchema = schemas;
          const updatedSchema = {}
          const schemaKeys = Object.keys(rawSchema);
          schemaKeys.forEach(key => {
            let updatedKey = extractContainerNameFromSchema(key)
            updatedSchema[updatedKey] = rawSchema[key]
          })
          console.log(updatedSchema)
          setSchema(updatedSchema)

          const amtOfLogTypes = Object.keys(listOfHeaderNames);

          const resultsObj = {}
          contNames.forEach(name => {
            result[name].forEach(row => {
              let dateStr = new Date(row['timestamp']);
              let formattedTime = dateStr.toDateString() + " " + msToTime(dateStr.getTime());
              row['timestamp'] = formattedTime;
            })

            resultsObj[name] = result[name];
          })

          setLogData(resultsObj);
          setContainersToBeShown(amtOfLogTypes);
          setProgressPending(false);

        },
        (error) => {
          setError(error);
        }
      )
  }

  const [tables, setTables] = React.useState(null);
  React.useEffect(() => {
    if (containersToBeShown.length > 0) {
      const tables = containersToBeShown.map(logtype =>

        < DataTableNonAgg
          columns={headerNames[logtype]}
          data={logData[logtype]}
          title={logtype}
          progressPending={progressPending}
        />

      )
      setTables(tables)
    }

  }, [headerNames, logData, containersToBeShown, progressPending])


  const [selectHostname, setSelectedHostname] = React.useState("none");
  const [selectLogType, setSelectedLogType] = React.useState("none");

  const start = new Date();
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  end.setSeconds(end.getSeconds() - 1);

  const [range, setRange] = React.useState({
    start: start,
    end: end,
  });

  // Query Builder section
  const [containerOptions, setContainerOptions] = React.useState(emptyOptions);
  const [userSelectedContainer, setUserSelectedContainer] = React.useState("");
  const [columnOptions, setColumnOptions] = React.useState(emptyOptions);
  const [inputsToDisabled, setInputsToDisabled] = React.useState(true);
  const [lastRow, setLastRow] = React.useState(1);

  React.useEffect(() => {
    if (schema !== null) {

      const updatedKeys = Object.keys(schema)
      const options = updatedKeys.map(cn => {
        return { "key": cn, "text": cn, "value": cn }
      })
      setContainerOptions(options);
    }
  }, [schema])

  const handleContainerSelection = (event: React.SyntheticEvent<HTMLElement>, { value }) => {

    const cols = schema[value];
    setUserSelectedContainer(value);
    const opts = cols.map((val: { name: String; type: String; }) => {
      return { "key": val.name, "text": val.name, "value": val.name, "type": val.type }
    })

    setInputsToDisabled(false);
    setColumnOptions(opts)
  }

  const handleLimitOption = (event: React.SyntheticEvent<HTMLElement>, { value }) => {
    console.log("limit option: ", value);
    setUserLimit(value);
  }

  useDidMountEffect(() => {
    //  console.log("range, selecthostname, range: ", selectHostname, selectLogType, range)
    queryGridDB(selectHostname, selectLogType, range);
  }, [range, selectHostname, selectLogType])

  const addNumOfRows = (newNum: number) => {
    newNum++
    let rows = []
    let max = 1;
    for (let i = 1; i < newNum; i++) {
      rows.push({ idx: i, queryRows: newNum })
      max = i
    }
    setLastRow(max);
    setQueryRows(rows);
    setNumOfQueryRows(rows.length)
  }

  const removeRow = (idx: number) => {
    const newRows = queryRows.filter((row) => row.idx !== idx)

    // find max index to assign the lock button to
    let max = 0;
    newRows.forEach(row => {
      let temp = Math.max(max, row.idx)
      max = temp;
    })
    const newQueries = queries.toSpliced(idx, 1)

    console.log("new queries: ", newQueries)
    setLastRow(max)
    setQueryRows(newRows);
    setNumOfQueryRows(newRows.length)
    setQueries(newQueries)
  }

  const initialRows = [
    { idx: 1, numOfRows: 1, high: 1 },
  ]

  const [queryRows, setQueryRows] = React.useState(initialRows);
  const [numOfQueryRows, setNumOfQueryRows] = React.useState(1);
  const [queries, setQueries] = React.useState([])
  const [selected, setSelected] = React.useState(false)
  const [advancedQueryResults, setAdvancedQueryResults] = React.useState(null);

  const sendQuery = (col: any, oper: any, val: any, idx: string | number, containerName: any, columnType: any) => {
    //console.log("Sending query index: ", idx, queries.length);
    let t = []
    if (queries.length >= 1) {
      t = [...queries]
    }
    t[idx] = {
      "containerName": containerName,
      "logtype": col,
      "operator": oper,
      "value": val,
      "valuetype": columnType,
      "limit": userLimit,
      "start": range.start.valueOf(),
      "end": range.end.valueOf(),
      "agg": aggregation,
      "interval": interval,
      "aggColumn": aggColumn,
      "interpolation": interpolation
    }
    // setSelected(!selected)
    setQueries(t)
  }

  const formAndSendQuery = () => {

    //console.log("queries: ", queries, userSelectedContainer);

    const newQueries = queries.filter(query => query !== undefined)
    //console.log("queries: removed empties", newQueries, userSelectedContainer);

    let url = `${HOST}advancedQuery?aggregation=${aggregation}`
    fetch(url, {
      method: "POST",
      mode: "cors",
      cache: "no-cache",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(newQueries)
    })
      .then(res => res.json())
      .then(
        result => setAdvancedQueryResults(result)
      )
    setSelected(false);
    setQueries([]);

    const dropdowns = document.querySelectorAll<HTMLElement>(".query-dropdown");

    const activeSelection = "2px solid gold"
    for (let item of dropdowns) {
      if (!selected)
        item.style.border = activeSelection
      else
        item.style.border = "none"
    }
  }

  React.useEffect(() => {
    console.log("User sleected containeR: ", userSelectedContainer, extractLogType(userSelectedContainer))
    console.log("Advaned query results: ", advancedQueryResults)
  }, [advancedQueryResults, headerNames, userSelectedContainer])

  const [aggregation, setAggregation] = React.useState(false);
  const [interval, setInterval] = React.useState("hour");
  const [aggColumn, setAggColumn] = React.useState(null);
  const [interpolation, setInterpolation] = React.useState("null")

  const handleAggregation = () => {
    setAggregation(!aggregation);
    // Reset the query rows back to default start
    setQueryRows(initialRows);
    setNumOfQueryRows(1);
  }

  const handleInterval = (e) => {
    setInterval(e.target.value)
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  } else if (!isLoaded) {
    return <div>Loading...</div>;
  } else {
    return (
      <div className="container flex justify-center">
        <RadioButtonContext.Provider value={{ setSelectedHostname, setSelectedLogType, selectHostname, selectLogType }}>
          <div className='pr-24'>
            <Sidebar logTypes={LogTypes} hostnames={Hostnames} />
          </div>

        {/* Home View */}
          <div className='flex'>
            <Tabs style="fullWidth">
              <Tabs.Item active title="Home">
                <div>
                  <DateRangeContext.Provider value={{ start, end, range, setRange }}>
                    < TimePicker />
                  </DateRangeContext.Provider>
                  <div className='justify-center py-10'>
                    {tables}
                  </div>
                </div>
              <h1><Link to="config" > Config Page</Link></h1>
              </Tabs.Item>


              {/* Advanced View */}
              <Tabs.Item title="Advanced View">
                <div className='grid grid-cols-5 gap-4'>
                  <Dropdown
                    placeholder="container"
                    name="container"
                    fluid
                    selection
                    search
                    className='col-span-2 col-start-1 p-5 m-5 text-lg'
                    options={containerOptions}
                    onChange={handleContainerSelection}
                  />

                  <div className='col-span-2 m-5'>
                    <DateRangeContext.Provider value={{ start, end, range, setRange }}>
                      < TimePicker />
                    </DateRangeContext.Provider>
                  </div>

                  <div className='col-span-1 m-5'>
                    <Dropdown
                      placeholder="Number of Rows"
                      name="limit"
                      fluid
                      selection
                      disabled={aggregation}
                      className='text-lg'
                      options={limitOptions}
                      onChange={handleLimitOption}
                    />

                  </div>

                </div>

                <div className='flex justify-center py-5'>
                  <Button.Group>
                    <Button
                      onClick={handleAggregation}
                      disabled={inputsToDisabled}
                      className={aggregation ? styles.activeButton : ""}
                    >
                      Aggregation
                    </Button>
                    <Button
                      value="hour"
                      onClick={e => handleInterval(e)}
                      disabled={!aggregation}
                      className={interval.includes("hour") ? styles.activeButton : ""}
                    >
                      Hour
                    </Button>
                    <Button
                      value="day"
                      onClick={e => handleInterval(e)}
                      disabled={!aggregation}
                      className={interval.includes("day") ? styles.activeButton : ""}
                    >
                      Day
                    </Button>
                  </Button.Group>
                </div>

                {queryRows.map(row => (
                  <QueryBuilder
                    key={row.idx}
                    index={row.idx}
                    numOfRows={numOfQueryRows}
                    addNumOfRows={addNumOfRows}
                    removeRow={removeRow}
                    lastRow={lastRow}
                    schema={schema}
                    sendQuery={sendQuery}
                    userSelectedContainer={userSelectedContainer}
                    columnOptions={columnOptions}
                    inputsToDisabled={inputsToDisabled}
                    setInputsToDisabled={setInputsToDisabled}
                    selected={selected}
                    setSelected={setSelected}
                    aggregation={aggregation}
                    setAggColumn={setAggColumn}
                    setInterpolation={setInterpolation}
                  />
                ))}


                <div className='flex justify-center py-5'>
                  <Button
                    disabled={!selected}
                    onClick={formAndSendQuery}
                    className='text-lg m-5'
                  >
                    <Button.Content visible>Submit Query</Button.Content>
                  </Button>
                </div>

                {advancedQueryResults && !aggregation
                  ?
                  < DataTableNonAgg
                    columns={headerNames[userSelectedContainer]}
                    data={advancedQueryResults["results"]}
                    title={userSelectedContainer}
                    progressPending={undefined}
                  />
                  :
                  <></>
                }

                {advancedQueryResults && aggregation
                  ?
                  <div>
                    < DataTableAgg
                      data={advancedQueryResults["results"]}
                      title={userSelectedContainer}
                      aggColumn={aggColumn}
                      progressPending={undefined}
                    />

                    < Chart data={advancedQueryResults} />

                  </div>
                  :
                  <></>



                }

              </Tabs.Item>

            </Tabs>

          </div>
        </RadioButtonContext.Provider>
      </div>

    );
  }
}
export default App;

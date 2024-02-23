import { useState, useEffect, useRef } from 'react';
import { RadioButtonContext } from './components/RadioButtonContext'
import { DateRangeContext } from './components/DateRangeContext';

import {
  generateColumns,
  msToTime,
  extractHostname,
  extractLogType,
  extractContainerNameFromSchema
} from './utils/General';

import { HOST, emptyOptions, limitOptions } from './utils/constants';
import styles from "./components/styles.module.css";

import DataTableNonAgg from './components/DataTableNonAgg';
import TimePicker from './components/TimePicker'
import Sidebar from './components/Sidebar';
import QueryBuilder from './components/QueryBuilder';
import Chart from './components/Chart';

import { Tabs } from 'flowbite-react';
import moment from 'moment';

import { Button, Dropdown } from 'semantic-ui-react'
import DataTableAgg from './components/DataTableAgg';


const useDidMountEffect = (func, deps) => {
  const didMount = useRef(false);
  useEffect(() => {
    if (didMount.current) {
      func();
    } else {
      didMount.current = true;
    }
  }, deps);
};

const initialRows = [
  { idx: 1, numOfRows: 1, high: 1 },
]

const App = () => {

  const useMountEffect = (fun) => useEffect(fun, [])
  const [error, setError] = useState(null);
  const [isLoaded, setIsLoaded] = useState(true);
  const [logData, setLogData] = useState(null);
  const [LogTypes, setLogTypes] = useState([]);
  const [Hostnames, setHostnames] = useState([]);
  const [userLimit, setUserLimit] = useState(100);


  useEffect(() => { document.body.style.backgroundColor = 'rgb(226 232 240)' }, [])

  useMountEffect(() => {
    console.log("getContainers: ", `${HOST}getContainers`)
    fetch(`${HOST}getContainers`)
      .then(res => res.json())
      .then(
        (result) => {
          const arrLogTypes = ["none"];
          const arrHostnames = ["none"];
          result.forEach(container => {
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

  const [schema, setSchema] = useState(null);
  const [headerNames, setHeaderNames] = useState(null);
  const [containersToBeShown, setContainersToBeShown] = useState([]);
  const [progressPending, setProgressPending] = useState(true);

  const queryGridDB = (hostname, logtype, range) => {
    setProgressPending(true);
    let start = range.start.valueOf();
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

  const [tables, setTables] = useState(null);
  useEffect(() => {
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


  const [selectHostname, setSelectedHostname] = useState("none");
  const [selectLogType, setSelectedLogType] = useState("none");
  const now = new Date();

  const start = moment(
    new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0)
  );

  const end = moment(start).add(1, 'days').subtract(1, 'seconds');

  const [range, setRange] = useState({
    start: start,
    end: end,
  });

  // Query Builder section
  const [containerOptions, setContainerOptions] = useState(emptyOptions);
  const [userSelectedContainer, setUserSelectedContainer] = useState("");
  const [columnOptions, setColumnOptions] = useState(emptyOptions);
  const [inputsToDisabled, setInputsToDisabled] = useState(true);
  const [lastRow, setLastRow] = useState(1);

  useEffect(() => {
    if (schema !== null) {

      const updatedKeys = Object.keys(schema)
      const options = updatedKeys.map(cn => {
        return { "key": cn, "text": cn, "value": cn }
      })
      setContainerOptions(options);
    }
  }, [schema])

  const handleContainerSelection = (e, { value }) => {

    const cols = schema[value];
    setUserSelectedContainer(value);
    const opts = cols.map(val => {
      return { "key": val.name, "text": val.name, "value": val.name, "type": val.type }
    })

    setInputsToDisabled(false);
    setColumnOptions(opts)
  }

  const handleLimitOption = (e, { value }) => {
    console.log("limit option: ", value);
    setUserLimit(value);
  }

  useDidMountEffect(() => {
    //  console.log("range, selecthostname, range: ", selectHostname, selectLogType, range)
    queryGridDB(selectHostname, selectLogType, range);
  }, [range, selectHostname, selectLogType])

  const addNumOfRows = (newNum) => {
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

  const removeRow = (idx) => {
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

  const [queryRows, setQueryRows] = useState(initialRows);
  const [numOfQueryRows, setNumOfQueryRows] = useState(1);
  const [queries, setQueries] = useState([])
  const [selected, setSelected] = useState(false)
  const [advancedQueryResults, setAdvancedQueryResults] = useState(null);

  const sendQuery = (col, oper, val, idx, containerName, columnType) => {
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

    const dropdowns = document.getElementsByClassName("query-dropdown");

    const activeSelection = "2px solid gold"
    for (let item of dropdowns) {
      if (!selected)
        item.style.border = activeSelection
      else
        item.style.border = "none"
    }
  }

  useEffect(() => {
    console.log("User sleected containeR: ", userSelectedContainer, extractLogType(userSelectedContainer))
    console.log("Advaned query results: ", advancedQueryResults)
  }, [advancedQueryResults, headerNames, userSelectedContainer])

  const [aggregation, setAggregation] = useState(false);
  const [interval, setInterval] = useState("hour");
  const [aggColumn, setAggColumn] = useState(null);
  const [interpolation, setInterpolation] = useState("null")

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

          <div className='flex'>
            <Tabs style="fullWidth">
              <Tabs.Item active title="Home">
                <div className=''>
                  <DateRangeContext.Provider value={{ start, end, range, setRange }}>
                    < TimePicker />
                  </DateRangeContext.Provider>
                  <div className='justify-center py-10'>
                    {tables}
                  </div>
                </div>

              </Tabs.Item>
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
                      color="info"
                      onClick={handleAggregation}
                      disabled={inputsToDisabled}
                      className={aggregation ? styles.activeButton : ""}
                    >
                      Aggregation
                    </Button>
                    <Button
                      color="info"
                      value="hour"
                      onClick={e => handleInterval(e)}
                      disabled={!aggregation}
                      className={interval.includes("hour") ? styles.activeButton : ""}
                    >
                      Hour
                    </Button>
                    <Button
                      color="info"
                      value="day"
                      onClick={e => handleInterval(e, "day")}
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
                    setLastRow={setLastRow}
                    sendQuery={sendQuery}
                    userSelectedContainer={userSelectedContainer}
                    columnOptions={columnOptions}
                    inputsToDisabled={inputsToDisabled}
                    setInputsToDisabled={setInputsToDisabled}
                    setContainerOptions={setContainerOptions}
                    selected={selected}
                    setSelected={setSelected}
                    schema={schema}
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

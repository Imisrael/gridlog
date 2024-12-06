export const extractHostname = (str: string) => typeof str === 'string' ? str.split('_')[1] : "";
export const extractLogType = (str: string) => typeof str === 'string' ? str.split('_')[2] : "";

export const extractContainerNameFromSchema = (str: string) => {
  let strSplit = str.split('_');
  strSplit.shift(); // remove word schema from beginning of container name
  let name = strSplit.join('_');
  //console.log("name from extract container name from schema: ", str,  name)
  return name
}

export function msToTime(duration: number) {
  let milliseconds: string | number = Math.floor((duration % 1000) / 100)
  let  seconds: string | number = Math.floor((duration / 1000) % 60)
  let  minutes: string | number = Math.floor((duration / (1000 * 60)) % 60)
  let hours: string | number = Math.floor((duration / (1000 * 60 * 60)) % 24);

  hours = (hours < 10) ? "0" + hours : hours;
  minutes = (minutes < 10) ? "0" + minutes : minutes;
  seconds = (seconds < 10) ? "0" + seconds : seconds;

  return hours + ":" + minutes + ":" + seconds + "." + milliseconds;
}

export const generateColumns = (schemas: { [x: string]: any[]; }) => {
  let listOfHeaderNames = {}
  for (const prop in schemas) {
    //ex of schema key name: schema_LOG_${hostname}_${logtype}
    const name = extractContainerNameFromSchema(prop);
    //console.log("name from extract container name: ", name)

    listOfHeaderNames[name] = []

    for (let i = 0; i < schemas[prop].length; i += 2) {
      const val = schemas[prop][i]
    //  console.log("value of headername: ", val, i, prop)

      let temp = {
        id: val,
        name: val,
        selector: (row: { [x: string]: any; }) => row[val],
        right: false,
        grow: 1,
        wrap: true,
        sortable: true,
        hide: 'md',
        conditionalCellStyles: [
          {
            when: row => row['exploit'] === 'true',
            style: {
              backgroundColor: 'rgba(234, 0, 0, 0.9)',
              color: 'white',
              '&:hover': {
                cursor: 'pointer',
              },
            }
          }

        ]
      }
      listOfHeaderNames[name].push(temp)
    }
  }
  return listOfHeaderNames;
}
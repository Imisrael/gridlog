import { useEffect, useState, useContext } from 'react';
import { RadioButtonContext } from "./RadioButtonContext";
import DropdownListItem from './DropdownListItem';
import useScript from '../hooks/useScript';


function LogTypeDropdown({ logTypes, hostnames }) {

  const { selectHostname, selectLogType} = useContext(RadioButtonContext);
  const [showVal, setShowVal] = useState(false);

  useScript('https://unpkg.com/flowbite@1.5.1/dist/flowbite.js');

  return (
    <>
      <button id="multiLevelDropdownButton" data-dropdown-toggle="dropdown" class="text-white bg-slate-600 hover:bg-slate-700 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-xl px-10 py-2.5 text-center inline-flex items-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800" type="button" onClick={() => setShowVal(true)}>
        {showVal == true ? `Hostname: ${selectHostname} Logtype: ${selectLogType}` : "Select Type of Log and/or a Hostname"}
        <svg class="w-2.5 h-2.5 ml-2.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6">
          <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 4 4 4-4" />
        </svg>
      </button>
      <div id="dropdown" class="z-10 hidden bg-white divide-y divide-gray-100 rounded-lg shadow w-44 dark:bg-gray-700">
        <ul class="px-4 text-lg text-gray-700 dark:text-gray-200" aria-labelledby="multiLevelDropdownButton">
          {hostnames.length > 0 ?
            hostnames.map((hostname, idx) =>
            (<DropdownListItem
              item={hostname}
              key={idx}
              id="hostname"
              name="radio-hostname"
              selectHostname={selectHostname}
            />)

            ) : <DropdownListItem />

          }
          <li>
            <button id="doubleDropdownButton" data-dropdown-toggle="doubleDropdown" data-dropdown-placement="right-start" type="button" class="flex items-center justify-between w-full px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">Log Types<svg class="w-2.5 h-2.5 ml-2.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 9 4-4-4-4" />
            </svg></button>
            <div id="doubleDropdown" class="z-10 hidden bg-white divide-y divide-gray-100 rounded-lg shadow w-44 dark:bg-gray-700">
              <ul class="py-2.5 pl-4 text-sm text-gray-700 dark:text-gray-200" aria-labelledby="doubleDropdownButton">

                {logTypes.length > 0 ?
                  logTypes.map((logType, idx) =>
                  (<DropdownListItem
                    item={logType}
                    key={idx}
                    id="logtype"
                    name="radio-logtype"
                    selectLogType={selectLogType}
                  />)

                  ) : <DropdownListItem />

                }

              </ul>
            </div>
          </li>
        </ul>
      </div>
    </>
  );
}

export default LogTypeDropdown;
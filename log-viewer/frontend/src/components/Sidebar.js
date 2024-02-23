import { useContext } from 'react';
import DropdownListItem from './DropdownListItem';
import useScript from '../hooks/useScript';
import { RadioButtonContext } from "./RadioButtonContext";

function Sidebar({ logTypes, hostnames }) {
  useScript('https://unpkg.com/flowbite@1.5.1/dist/flowbite.js');
  const { selectHostname, selectLogType } = useContext(RadioButtonContext);

  return (
    <>


      <aside id="sidebar-multi-level-sidebar" class="fixed top-0 left-0 z-40 w-64 h-screen transition-transform -translate-x-full sm:translate-x-0" aria-label="Sidebar">
        <div class="h-full px-3 py-4 overflow-y-auto bg-slate-100 fixed">
          <ul class="space-y-2 font-medium">
            <li>
              <button type="button" class="flex items-center w-full p-2 text-base text-gray-900 transition duration-75 rounded-lg group hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700" aria-controls="dropdown-example" data-collapse-toggle="Hostnames">

                <svg class="w-[19px] h-[19px] text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                  <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.7" d="M6 14H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v1M5 19h5m-9-9h5m4-4h8a1 1 0 0 1 1 1v12H9V7a1 1 0 0 1 1-1Zm6 8a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z" />
                </svg>
                <span class="flex-1 ml-3 text-left  whitespace-nowrap">Hostnames</span>
                <svg class="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6">
                  <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 4 4 4-4" />
                </svg>
              </button>
              <ul id="Hostnames" class="hidden py-2 space-y-2">
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
              </ul>
            </li>
            <li>
              <button type="button" class="flex items-center w-full p-2 text-base text-gray-900 transition duration-75 rounded-lg group hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700" aria-controls="dropdown-example" data-collapse-toggle="Logtype">
                <svg class="w-[19px] h-[19px] text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                  <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.7" d="M18 5h1v12a2 2 0 0 1-2 2m0 0a2 2 0 0 1-2-2V2a1 1 0 0 0-1-1H2a1 1 0 0 0-1 1v15a2 2 0 0 0 2 2h14ZM10 4h2m-2 3h2m-8 3h8m-8 3h8m-8 3h8M4 4h3v3H4V4Z" />
                </svg>
                <span class="flex-1 ml-3 text-left whitespace-nowrap">Log Types</span>
                <svg class="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6">
                  <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 4 4 4-4" />
                </svg>
              </button>
              <ul id="Logtype" class="hidden py-2 space-y-2">
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
            </li>

          </ul>
        </div>
      </aside>

    </>
  )
}

export default Sidebar;
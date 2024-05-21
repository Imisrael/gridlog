import * as React from "react";
import ConfigForm from "../components/ConfigForm.tsx";
import ManagedLogTypes from "../components/ManagedLogTypes.tsx";
import { Link } from "react-router-dom";
import { HOST } from "../utils/constants.tsx";

export default function UserConfig() {
  const [exampleLogEntry, setExampleLogEntry] = React.useState(null);
  const [keyNames, setKeyNames] = React.useState(null);

  React.useEffect(() => {
    fetch(`${HOST}getConfigKeyNames`)
      .then(res => res.json())
      .then(
        (result) => {
          console.log("Results", result)
          setKeyNames(result);
        },
        (error) => {
          console.log("Errororor ", error)
        }
      )
  }, [])



  return (
    <>
      <div className="flex justify-center m-5">
        <Link to="/"><button className="text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-green-600 dark:hover:bg-green-700 focus:outline-none dark:focus:ring-green-800 justify-start">Home</button></Link>
        <ManagedLogTypes setExampleLogEntry={setExampleLogEntry} />
      </div>

      <ConfigForm exampleLogEntry={exampleLogEntry} keyNames={keyNames} />

    </>
  )
}
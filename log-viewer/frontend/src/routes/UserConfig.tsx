import * as React from "react";
import ConfigForm from "../components/ConfigForm.tsx";
import ManagedLogTypes from "../components/ManagedLogTypes.tsx";
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
        <ManagedLogTypes setExampleLogEntry={setExampleLogEntry} />
      </div>

      <ConfigForm exampleLogEntry={exampleLogEntry} keyNames={keyNames} />

    </>
  )
}
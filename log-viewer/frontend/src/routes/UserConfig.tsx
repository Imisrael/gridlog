import * as React from "react";
import ConfigForm from "../components/ConfigForm.tsx";
import ManagedLogTypes from "../components/ManagedLogTypes.tsx";

export default function UserConfig() {
  const [exampleLogEntry, setExampleLogEntry] = React.useState(null);

  return (
    <>
      <ManagedLogTypes setExampleLogEntry={setExampleLogEntry} />
      <ConfigForm exampleLogEntry={exampleLogEntry}/>
    </>
  )
}
import * as React from "react";
import ConfigForm from "../components/ConfigForm.tsx";
import ManagedLogTypes from "../components/ManagedLogTypes.tsx";
import { HOST } from "../utils/constants.tsx";
import { useNavigate } from "react-router-dom";
import { IoMdArrowRoundBack } from "react-icons/io";
import { IconContext } from "react-icons";

export default function UserConfig() {
  const [exampleLogEntry, setExampleLogEntry] = React.useState(null);
  const [keyNames, setKeyNames] = React.useState(null);
  const [disableAddRemove, setDisableAddRemove] = React.useState(false);

  const navigate = useNavigate();

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

  React.useEffect(() => {
    if (exampleLogEntry !== null) {
      setDisableAddRemove(true);
      console.log("Setting disable/add to true: ");
    }

  }, [exampleLogEntry])

  console.log("disable add remove: ", disableAddRemove);

  return (
    <>
      <div className="flex justify-center m-5">

        <div className='cursor-pointer stroke-slate-500 hover:stroke-slate-700'>
          <IconContext.Provider value={{ color: "darkcyan", className: "global-class-name" }}>
            <div>
              <IoMdArrowRoundBack className='h-10 w-10 ' onClick={() => navigate("/")} />
            </div>
          </IconContext.Provider>
        </div>
        <ManagedLogTypes setExampleLogEntry={setExampleLogEntry} />
      </div>

      <ConfigForm exampleLogEntry={exampleLogEntry} keyNames={keyNames} disableAddRemove={disableAddRemove} />

    </>
  )
}
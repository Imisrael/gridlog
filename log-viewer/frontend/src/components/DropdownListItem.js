
import { useContext } from "react";
import { RadioButtonContext } from "./RadioButtonContext";

function DropdownListItem({ item, id, name }) {

  const { setSelectedHostname, setSelectedLogType } = useContext(RadioButtonContext);

  const onOptionChange = (e) => {
    if (name === "radio-hostname") {
      setSelectedHostname(e.target.value);
    } else if (name === "radio-logtype") {
      setSelectedLogType(e.target.value);
    }
  }

  return (
    <li>
      <div class="flex items-center px-5">
        <input
          defaultChecked={item === "none" ? true : false} // sets the first option, none, to be on by default
          id={id} type="radio"
          value={item}
          name={name}
          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-700 dark:focus:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500 "
          onChange={onOptionChange}
        />
        <label for="default-radio-1" class="ml-2 text-base font-medium text-gray-900 dark:text-gray-300 ">{item}</label>
      </div>
    </li>
  )

}

export default DropdownListItem;
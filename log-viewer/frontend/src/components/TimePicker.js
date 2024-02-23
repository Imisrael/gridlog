import { useContext,  useState } from 'react';
import DateTimePicker from 'react-tailwindcss-datetimepicker';
import moment from 'moment';
import { DateRangeContext } from './DateRangeContext';

function TimePicker() {
  const { start, end, range, setRange} = useContext(DateRangeContext);

  const ranges = {
    Today: [moment(start), moment(end)],
    Yesterday: [
      moment(start).subtract(1, 'days'),
      moment(end).subtract(1, 'days'),
    ],
    '3 Days': [moment(start).subtract(3, 'days'), moment(end)],
    '2 Weeks': [moment(start).subtract(14, 'days'), moment(end)],
  };

  const local = {
    format: 'MM-DD-YYYY HH:mm',
    sundayFirst: true,
  };
  const maxDate = moment(start).add(24, 'hour');

  function handleApply(startDate, endDate) {
    setRange({ start: startDate, end: endDate });
    setShowVal(true)
    console.log(startDate)
  }

  const formateDateRange = (time) => time.format('MM/DD/YYYY HH:mm')

  const [showVal, setShowVal] = useState(true);

  return (
    <DateTimePicker
      ranges={ranges}
      start={range.start}
      end={range.end}
      local={local}
      maxDate={maxDate}
      applyCallback={handleApply}
      smartMode
    >
      <input
        placeholder="Enter date..."
        className="text-stone-800 hover:text-stone-900 ring-gray-600 focus:outline-none hover:ring-blue-400 font-medium rounded-lg text-lg px-10 py-2.5 text-center inline-flex items-center w-96 ring-offset-1 ring-1"
        value= {
          showVal === true ? `${formateDateRange(range.start)} - ${formateDateRange(range.end)}` : "Default Date Range:  (Today)"}
      />
    </DateTimePicker>
  );
}

export default TimePicker;
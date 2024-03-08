
import * as React from 'react';
import { add, set, format } from 'date-fns';
import {DateRangeContext}  from './DateRangeContext.tsx'
import DateTimePicker from 'react-tailwindcss-datetimepicker';

export default function TimePicker(): React.JSX.Element {

  const { start, end, range, setRange } = React.useContext(DateRangeContext);

  function getPastDays(start: Date, end: Date, daysBeforeToday: number): number[] {
    return [ new Date(start).setDate(start.getDate() - daysBeforeToday), new Date(end).setDate(end.getDate())]
  }

  const now = new Date();
  const ranges = {
    Today: [new Date(start), new Date(end)],
    Yesterday: [ new Date(start).setDate(start.getDate() - 1), new Date(end).setDate(end.getDate() - 1)],
    "Last Two Days": getPastDays(start, end, 1),
    "Last 3 Days": getPastDays(start, end, 3),
    "PLast Week": getPastDays(start, end, 7),
    "Last 30 Days": [
      new Date(
        now.getFullYear(),
        now.getMonth() - 1,
        now.getDate(),
        0,
        0,
        0,
        0
      ),
      new Date(end),
    ],
  }



  const locale = {
    format: 'dd-MM-yyyy HH:mm', // See: https://date-fns.org/v2.16.1/docs/format
    sundayFirst: false,
    days: ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'So'],
    months: [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ],
    fromDate: 'From Date',
    toDate: 'To Date',
    selectingFrom: 'Selecting From',
    selectingTo: 'Selecting To',
    maxDate: 'Max Date',
    close: 'Close',
    apply: 'Apply',
    cancel: 'Cancel',
  };

  function handleApply(startDate: Date, endDate: Date) {
    setRange({ start: startDate, end: endDate });
    console.log(startDate)
  }

  function getUserFriendlyDateRangeString() {
    const formattedSelectedStart = format(
      range.start,
      'MMM d, yyyy h:mm a'
    );
    const formattedSelectedEnd = format(
      range.end,
      'MMM d, yyyy h:mm a'
    );
    const formattedDateRange = `${formattedSelectedStart} to ${formattedSelectedEnd}`;

    return formattedDateRange;
  }

  return (
    <DateTimePicker
      ranges={ranges}
      start={range.start}
      end={range.end}
      locale={locale}
      applyCallback={handleApply}
      smartMode
      maxDate={set(add(start, { days: 1 }), {
        hours: 23,
        minutes: 59,
        seconds: 59,
      })}
    >
      <input
        placeholder="Enter date..."
        className="text-stone-800 hover:text-stone-900 ring-gray-600 focus:outline-none hover:ring-blue-400 font-medium rounded-lg text-lg px-10 py-2.5 text-center inline-flex items-center w-96 ring-offset-1 ring-1"
        value={getUserFriendlyDateRangeString()}
      />
    </DateTimePicker>
  );
}
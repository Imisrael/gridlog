import DataTable from './DataTableBase';
import {
  msToTime,
} from '../utils/General';

function DataTableAgg({ data, progressPending, title, aggColumn }) {


  //timestamp,count(statusCode), avg(contentLength), min(contentLength), max(contentLength)

  data.forEach(row => {
      let dateStr = new Date(row['timestamp']);
      let formattedTime = dateStr.toDateString() + " " + msToTime(dateStr.getTime());
      row['timestamp'] = formattedTime;

  })

  const columns = [
    {
      name: "Time Range",
      selector: row => row.timestamp
    },
    {
      name: `Count`,
      selector: row => row.count
    },
    {
      name: `Average (${aggColumn})`,
      selector: row => row.avg
    },
    {
      name: `Maximum (${aggColumn})`,
      selector: row => row.max
    },
    {
      name: `Minimum (${aggColumn})`,
      selector: row => row.min
    }
  ]

  return (
    <>
      <div className='my-10 basis-full'>
        <DataTable
          columns={columns}
          data={data}
          progressPending={progressPending}
          title={`${title}_aggregation`}
        />
      </div>
    </>


  )
}

export default DataTableAgg;
import DataTable from './DataTableBase';

function DataTableNew({ columns, data, progressPending, title }) {

  
  return (
    <>
      <div className='my-10 basis-full'>
        <DataTable 
        columns={columns} 
        data={data} 
        progressPending={progressPending}
        title={title}
        />
      </div>
    </>


  )
}

export default DataTableNew;
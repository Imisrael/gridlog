import React from 'react';
import DataTable from 'react-data-table-component';

function DataTableBase(props) {
	return (
		<DataTable
			pagination
            progressPending
            persistTableHead
            striped
			fixedHeader={true}
			{...props}
		/>
	);
}

export default DataTableBase;
import React from 'react';
import DataTable from 'react-data-table-component';

function DataTableBase(props) {
	return (
		<DataTable
			pagination
            progressPending
            persistTableHead
            striped
			{...props}
		/>
	);
}

export default DataTableBase;
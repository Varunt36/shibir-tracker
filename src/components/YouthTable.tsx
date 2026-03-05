import { DataGrid, GridColDef } from '@mui/x-data-grid'
import { IconButton } from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'

interface Youth {
  id: string
  name: string
  phone: string | null
  email: string | null
}

interface Props {
  rows: Youth[]
  onEdit: (row: Youth) => void
  onDelete: (row: Youth) => void
}

export default function YouthTable({ rows, onEdit, onDelete }: Props) {
  const columns: GridColDef[] = [
    { field: 'name', headerName: 'Name', flex: 1 },
    { field: 'phone', headerName: 'Phone', flex: 1 },
    { field: 'email', headerName: 'Email', flex: 1 },
    {
      field: 'actions', headerName: 'Actions', width: 100, sortable: false,
      renderCell: (params) => (
        <>
          <IconButton size="small" onClick={() => onEdit(params.row)}><EditIcon fontSize="small" /></IconButton>
          <IconButton size="small" color="error" onClick={() => onDelete(params.row)}><DeleteIcon fontSize="small" /></IconButton>
        </>
      ),
    },
  ]

  return (
    <DataGrid
      rows={rows}
      columns={columns}
      pageSizeOptions={[25, 50, 100]}
      initialState={{ pagination: { paginationModel: { pageSize: 25 } } }}
      disableRowSelectionOnClick
      autoHeight
    />
  )
}

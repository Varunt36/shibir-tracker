import { useState } from 'react'
import {
  Table, TableHead, TableBody, TableRow, TableCell, TableFooter,
  TextField, Chip, Typography, Button, Box, TableSortLabel
} from '@mui/material'
import Papa from 'papaparse'
import { upsertPayment } from '../api/payments'

interface PaymentRow {
  youth_id: string
  shibir_id: string
  amount_paid: number
  youth: { id: string; name: string } | null
}

interface Props {
  rows: PaymentRow[]
  fee: number
  shibirTitle: string
  onUpdate: () => void
}

function getStatus(paid: number, fee: number): { label: string; color: 'success' | 'warning' | 'error' } {
  if (paid >= fee) return { label: 'Paid', color: 'success' }
  if (paid > 0) return { label: 'Partial', color: 'warning' }
  return { label: 'Unpaid', color: 'error' }
}

type OrderBy = 'name' | 'status'
const STATUS_RANK: Record<string, number> = { Paid: 0, Partial: 1, Unpaid: 2 }

export default function FinanceTable({ rows, fee, shibirTitle, onUpdate }: Props) {
  const [values, setValues] = useState<Record<string, string>>(
    Object.fromEntries(rows.map(r => [r.youth_id, String(r.amount_paid)]))
  )
  const [orderBy, setOrderBy] = useState<OrderBy>('name')
  const [order, setOrder] = useState<'asc' | 'desc'>('asc')

  function handleSort(column: OrderBy) {
    if (orderBy === column) {
      setOrder(o => (o === 'asc' ? 'desc' : 'asc'))
    } else {
      setOrderBy(column)
      setOrder('asc')
    }
  }

  const sortedRows = [...rows].sort((a, b) => {
    let cmp = 0
    if (orderBy === 'name') {
      cmp = (a.youth?.name ?? '').localeCompare(b.youth?.name ?? '')
    } else {
      const aStatus = getStatus(Number(values[a.youth_id] ?? a.amount_paid), fee).label
      const bStatus = getStatus(Number(values[b.youth_id] ?? b.amount_paid), fee).label
      cmp = STATUS_RANK[aStatus] - STATUS_RANK[bStatus]
    }
    return order === 'asc' ? cmp : -cmp
  })

  async function handleSave(shibirId: string, youthId: string) {
    await upsertPayment(shibirId, youthId, Number(values[youthId] ?? 0))
    onUpdate()
  }

  const totalPaid = rows.reduce((s, r) => s + Number(values[r.youth_id] ?? r.amount_paid), 0)
  const totalExpected = fee * rows.length
  const totalPending = totalExpected - totalPaid

  function handleExport() {
    const data = rows.map(r => ({
      name: r.youth?.name,
      amount_paid: values[r.youth_id] ?? r.amount_paid,
      remaining: fee - Number(values[r.youth_id] ?? r.amount_paid),
      status: getStatus(Number(values[r.youth_id] ?? r.amount_paid), fee).label,
    }))
    const csv = Papa.unparse(data)
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = `${shibirTitle}-finance.csv`; a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
        <Button variant="outlined" size="small" onClick={handleExport}>Export CSV</Button>
      </Box>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell sortDirection={orderBy === 'name' ? order : false}>
              <TableSortLabel
                active={orderBy === 'name'}
                direction={orderBy === 'name' ? order : 'asc'}
                onClick={() => handleSort('name')}
                sx={{ '& .MuiTableSortLabel-icon': { opacity: `${orderBy === 'name' ? 1 : 0.4} !important` } }}
              >
                Name
              </TableSortLabel>
            </TableCell>
            <TableCell>Amount Paid</TableCell>
            <TableCell>Remaining</TableCell>
            <TableCell sortDirection={orderBy === 'status' ? order : false}>
              <TableSortLabel
                active={orderBy === 'status'}
                direction={orderBy === 'status' ? order : 'asc'}
                onClick={() => handleSort('status')}
                sx={{ '& .MuiTableSortLabel-icon': { opacity: `${orderBy === 'status' ? 1 : 0.4} !important` } }}
              >
                Status
              </TableSortLabel>
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {sortedRows.map(row => {
            const paid = Number(values[row.youth_id] ?? row.amount_paid)
            const remaining = fee - paid
            const status = getStatus(paid, fee)
            return (
              <TableRow key={row.youth_id}>
                <TableCell>{row.youth?.name}</TableCell>
                <TableCell>
                  <TextField
                    size="small"
                    type="number"
                    value={values[row.youth_id] ?? '0'}
                    onChange={e => setValues(v => ({ ...v, [row.youth_id]: e.target.value }))}
                    onBlur={() => handleSave(row.shibir_id, row.youth_id)}
                    onKeyDown={e => e.key === 'Enter' && handleSave(row.shibir_id, row.youth_id)}
                    sx={{ width: 110 }}
                    InputProps={{ startAdornment: <span style={{ marginRight: 4 }}>€</span> }}
                  />
                </TableCell>
                <TableCell>€{remaining}</TableCell>
                <TableCell><Chip label={status.label} color={status.color} size="small" /></TableCell>
              </TableRow>
            )
          })}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell><Typography fontWeight="bold">Totals</Typography></TableCell>
            <TableCell><Typography fontWeight="bold">€{totalPaid}</Typography></TableCell>
            <TableCell><Typography fontWeight="bold">€{totalPending}</Typography></TableCell>
            <TableCell><Typography variant="body2" color="text.secondary">Expected: €{totalExpected}</Typography></TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </Box>
  )
}

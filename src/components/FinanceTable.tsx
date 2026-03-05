import { useState } from 'react'
import {
  Table, TableHead, TableBody, TableRow, TableCell, TableFooter,
  TextField, Chip, Typography, Button, Box
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

export default function FinanceTable({ rows, fee, shibirTitle, onUpdate }: Props) {
  const [values, setValues] = useState<Record<string, string>>(
    Object.fromEntries(rows.map(r => [r.youth_id, String(r.amount_paid)]))
  )

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
            <TableCell>Name</TableCell>
            <TableCell>Amount Paid</TableCell>
            <TableCell>Remaining</TableCell>
            <TableCell>Status</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map(row => {
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

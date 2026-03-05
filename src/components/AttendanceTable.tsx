import { useState } from 'react'
import {
  Table, TableHead, TableBody, TableRow, TableCell,
  Select, MenuItem, Chip, CircularProgress
} from '@mui/material'
import { upsertAttendance } from '../api/attendance'

type Status = 'coming' | 'not_coming' | 'unsure'

interface AttendanceRow {
  youth_id: string
  status: Status
  youth: { id: string; name: string; phone: string | null } | null
}

interface Props {
  rows: AttendanceRow[]
  shibirId: string
  onUpdate: () => void
}

const STATUS_COLORS: Record<Status, 'success' | 'error' | 'default'> = {
  coming: 'success',
  not_coming: 'error',
  unsure: 'default',
}
const STATUS_LABELS: Record<Status, string> = {
  coming: 'Coming',
  not_coming: 'Not Coming',
  unsure: 'Unsure',
}

export default function AttendanceTable({ rows, shibirId, onUpdate }: Props) {
  const [saving, setSaving] = useState<Record<string, boolean>>({})

  async function handleStatusChange(youthId: string, status: Status) {
    setSaving(s => ({ ...s, [youthId]: true }))
    await upsertAttendance(shibirId, youthId, status)
    setSaving(s => ({ ...s, [youthId]: false }))
    onUpdate()
  }

  return (
    <Table size="small">
      <TableHead>
        <TableRow>
          <TableCell>Name</TableCell>
          <TableCell>Phone</TableCell>
          <TableCell>Status</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {rows.map(row => (
          <TableRow key={row.youth_id}>
            <TableCell>{row.youth?.name}</TableCell>
            <TableCell>{row.youth?.phone ?? '—'}</TableCell>
            <TableCell>
              {saving[row.youth_id]
                ? <CircularProgress size={20} />
                : (
                  <Select
                    size="small"
                    value={row.status}
                    onChange={e => handleStatusChange(row.youth_id, e.target.value as Status)}
                    renderValue={v => <Chip label={STATUS_LABELS[v as Status]} color={STATUS_COLORS[v as Status]} size="small" />}
                  >
                    <MenuItem value="coming">Coming</MenuItem>
                    <MenuItem value="not_coming">Not Coming</MenuItem>
                    <MenuItem value="unsure">Unsure</MenuItem>
                  </Select>
                )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

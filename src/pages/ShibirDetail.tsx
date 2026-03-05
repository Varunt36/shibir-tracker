import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Box, Typography, Tabs, Tab, CircularProgress, Chip, Stack } from '@mui/material'
import { getShibirById } from '../api/shibirs'
import { getAttendance, initAttendanceForShibir } from '../api/attendance'
import { getPayments, initPaymentsForShibir } from '../api/payments'
import { getYouth } from '../api/youth'
import AttendanceTable from '../components/AttendanceTable'
import FinanceTable from '../components/FinanceTable'

interface Shibir {
  id: string
  title: string
  start_date: string | null
  end_date: string | null
  fee: number
}

export default function ShibirDetail() {
  const { id } = useParams<{ id: string }>()
  const [shibir, setShibir] = useState<Shibir | null>(null)
  const [attendance, setAttendance] = useState<any[]>([])
  const [payments, setPayments] = useState<any[]>([])
  const [tab, setTab] = useState(0)
  const [loading, setLoading] = useState(true)

  async function load() {
    if (!id) return
    setLoading(true)
    const [shibirData, allYouth] = await Promise.all([getShibirById(id), getYouth()])
    setShibir(shibirData)

    const youthIds = allYouth.map((y: any) => y.id)
    await Promise.all([
      initAttendanceForShibir(id, youthIds),
      initPaymentsForShibir(id, youthIds),
    ])

    const [att, pay] = await Promise.all([getAttendance(id), getPayments(id)])
    setAttendance(att)
    setPayments(pay)
    setLoading(false)
  }

  useEffect(() => { load() }, [id])

  if (loading || !shibir) return <CircularProgress />

  const coming = attendance.filter((a: any) => a.status === 'coming').length
  const notComing = attendance.filter((a: any) => a.status === 'not_coming').length
  const unsure = attendance.filter((a: any) => a.status === 'unsure').length

  return (
    <Box>
      <Typography variant="h5" mb={1}>{shibir.title}</Typography>
      <Typography variant="body2" color="text.secondary" mb={1}>
        {shibir.start_date} → {shibir.end_date ?? '?'} · Fee: €{shibir.fee}
      </Typography>
      <Stack direction="row" spacing={1} mb={2}>
        <Chip label={`Coming: ${coming}`} color="success" size="small" />
        <Chip label={`Not Coming: ${notComing}`} color="error" size="small" />
        <Chip label={`Unsure: ${unsure}`} color="default" size="small" />
      </Stack>
      <Tabs value={tab} onChange={(_: React.SyntheticEvent, v: number) => setTab(v)} sx={{ mb: 2 }}>
        <Tab label="Attendance" />
        <Tab label="Finance" />
      </Tabs>
      {tab === 0 && (
        <AttendanceTable rows={attendance} shibirId={id!} onUpdate={load} />
      )}
      {tab === 1 && (
        <FinanceTable rows={payments} fee={shibir.fee} shibirTitle={shibir.title} onUpdate={load} />
      )}
    </Box>
  )
}

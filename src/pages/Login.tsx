import { useState } from 'react'
import { Box, Button, TextField, Typography, Paper, Alert } from '@mui/material'
import { supabase } from '../lib/supabase'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setError(error.message)
    setLoading(false)
  }

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'grey.100' }}>
      <Paper sx={{ p: 4, width: 360 }}>
        <Typography variant="h5" mb={3} textAlign="center">Shibir Admin</Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <form onSubmit={handleLogin}>
          <TextField
            fullWidth label="Email" type="email" value={email}
            onChange={e => setEmail(e.target.value)} margin="normal" required
          />
          <TextField
            fullWidth label="Password" type="password" value={password}
            onChange={e => setPassword(e.target.value)} margin="normal" required
          />
          <Button fullWidth variant="contained" type="submit" sx={{ mt: 2 }} disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>
      </Paper>
    </Box>
  )
}

import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material'
import { Session } from '@supabase/supabase-js'
import { supabase } from './lib/supabase'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Youth from './pages/Youth'
import Shibirs from './pages/Shibirs'
import ShibirDetail from './pages/ShibirDetail'
import Layout from './components/Layout'

const theme = createTheme()

function ProtectedRoute({ session, children }: { session: Session | null; children: React.ReactNode }) {
  if (!session) return <Navigate to="/login" replace />
  return <Layout>{children}</Layout>
}

export default function App() {
  const [session, setSession] = useState<Session | null | undefined>(undefined)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
    return () => subscription.unsubscribe()
  }, [])

  if (session === undefined) return null

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={session ? <Navigate to="/" replace /> : <Login />} />
          <Route path="/" element={<ProtectedRoute session={session}><Dashboard /></ProtectedRoute>} />
          <Route path="/youth" element={<ProtectedRoute session={session}><Youth /></ProtectedRoute>} />
          <Route path="/shibirs" element={<ProtectedRoute session={session}><Shibirs /></ProtectedRoute>} />
          <Route path="/shibirs/:id" element={<ProtectedRoute session={session}><ShibirDetail /></ProtectedRoute>} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  )
}

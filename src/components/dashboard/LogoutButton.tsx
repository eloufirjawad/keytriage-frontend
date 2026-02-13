'use client'

import { useState } from 'react'

import { useRouter } from 'next/navigation'

import Button from '@mui/material/Button'

const LogoutButton = () => {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleLogout = async () => {
    setLoading(true)

    try {
      await fetch('/api/auth/logout', { method: 'POST' })
    } finally {
      router.replace('/login')
      router.refresh()
      setLoading(false)
    }
  }

  return (
    <Button variant='outlined' color='inherit' disabled={loading} onClick={handleLogout}>
      {loading ? 'Signing out...' : 'Logout'}
    </Button>
  )
}

export default LogoutButton

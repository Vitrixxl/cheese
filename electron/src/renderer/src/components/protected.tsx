import { useOptionalUser } from '@/hooks/use-user'
import type { PropsWithChildren } from 'react'
import React from 'react'
import { useNavigate } from 'react-router'

export default function Protected({ children }: PropsWithChildren) {
  const { user, isPending } = useOptionalUser()
  const navigate = useNavigate()
  React.useEffect(() => {
    if (!user && !isPending) {
      navigate('/login')
    }
  }, [user])

  if (!user) return null
  return children
}

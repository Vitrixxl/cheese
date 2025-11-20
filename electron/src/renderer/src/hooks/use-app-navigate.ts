import { currentDriverAtom } from '@/store'
import { useAtomValue } from 'jotai'
import { useNavigate } from 'react-router'

export const useAppNavigate = () => {
  const navigate = useNavigate()
  const currentDriver = useAtomValue(currentDriverAtom)
  return (path: string) => {
    if (currentDriver == 'online') {
      return
    }
    navigate(path)
  }
}

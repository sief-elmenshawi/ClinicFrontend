import { useQuery } from '@tanstack/react-query'
import { getCurrentPatient } from '../api/patients'

export function useCurrentPatient() {
  return useQuery({
    queryKey: ['patients', 'me'],
    queryFn: getCurrentPatient,
    retry: 1,
  })
}
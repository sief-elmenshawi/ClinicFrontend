import { useQuery } from '@tanstack/react-query'
import { getCurrentDoctor } from '../api/doctors'

export function useCurrentDoctor() {
  return useQuery({
    queryKey: ['doctors', 'me'],
    queryFn: getCurrentDoctor,
    retry: 1,
  })
}
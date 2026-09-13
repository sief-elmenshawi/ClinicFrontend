import type { CreateSpecializationCommand, PagedResult, SpecializationDto } from '../types'
import { api } from './client'

export async function getSpecializations(pageNumber = 1, pageSize = 20): Promise<PagedResult<SpecializationDto>> {
  const { data } = await api.get<PagedResult<SpecializationDto>>('/specializations', {
    params: { pageNumber, pageSize },
  })
  return data
}

export async function createSpecialization(command: CreateSpecializationCommand): Promise<number> {
  const { data } = await api.post<number>('/specializations', command)
  return data
}
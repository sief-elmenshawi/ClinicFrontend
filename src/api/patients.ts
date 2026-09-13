import type { CurrentPatientDto, CreatePatientCommand } from '../types'
import { api } from './client'

export async function getCurrentPatient(): Promise<CurrentPatientDto> {
  const { data } = await api.get<CurrentPatientDto>('/patients/me')
  return data
}

export async function createPatient(command: CreatePatientCommand): Promise<number> {
  const { data } = await api.post<number>('/patients', command)
  return data
}
import type {
  AddUnavailabilityCommand,
  AddWorkingHourCommand,
  AvailableSlotDto,
  CreateDoctorCommand,
  DoctorDto,
  DoctorRatingsSummaryDto,
  PagedResult,
} from '../types'
import { api } from './client'

export interface CurrentDoctorDto {
  id: number
  fullName: string
}

export async function getCurrentDoctor(): Promise<CurrentDoctorDto> {
  const { data } = await api.get<CurrentDoctorDto>('/doctors/me')
  return data
}

export interface DoctorListItemDto {
  id: number
  fullName: string
  specializationName: string
  consultationFee: number
}

export async function getAllDoctors(pageNumber = 1, pageSize = 50): Promise<PagedResult<DoctorListItemDto>> {
  const { data } = await api.get<PagedResult<DoctorListItemDto>>('/doctors', {
    params: { pageNumber, pageSize },
  })
  return data
}

export async function getDoctorsBySpecialization(
  specializationId: number,
): Promise<DoctorDto[]> {
  const { data } = await api.get<DoctorDto[]>(
    `/doctors/by-specialization/${specializationId}`,
  )
  return data
}

export async function getAvailableSlots(
  doctorId: number,
  date: string,
): Promise<AvailableSlotDto[]> {
  const { data } = await api.get<AvailableSlotDto[]>(
    `/doctors/${doctorId}/available-slots`,
    { params: { date } },
  )
  return data
}

export async function getDoctorRatings(
  doctorId: number,
): Promise<DoctorRatingsSummaryDto> {
  const { data } = await api.get<DoctorRatingsSummaryDto>(
    `/doctors/${doctorId}/ratings`,
  )
  return data
}

export async function createDoctor(command: CreateDoctorCommand): Promise<number> {
  const { data } = await api.post<number>('/doctors', command)
  return data
}

export async function deleteDoctor(doctorId: number): Promise<void> {
  await api.delete(`/doctors/${doctorId}`)
}

export async function addWorkingHour(command: AddWorkingHourCommand): Promise<number> {
  const { data } = await api.post<number>(
    `/doctors/${command.doctorId}/working-hours`,
    command,
  )
  return data
}

export async function addUnavailability(
  command: AddUnavailabilityCommand,
): Promise<number> {
  const { data } = await api.post<number>(
    `/doctors/${command.doctorId}/unavailability`,
    command,
  )
  return data
}
import type {
  AppointmentDto,
  CreateAppointmentCommand,
  PagedResult,
  RateDoctorCommand,
  RescheduleAppointmentCommand,
} from '../types'
import { api } from './client'

export async function createAppointment(
  command: CreateAppointmentCommand,
): Promise<number> {
  const { data } = await api.post<number>('/appointments', command)
  return data
}

export async function getPatientAppointments(
  patientId: number,
): Promise<AppointmentDto[]> {
  const { data } = await api.get<AppointmentDto[]>(
    `/appointments/patient/${patientId}`,
  )
  return data
}

export async function getDoctorAppointments(
  doctorId: number,
  date?: string,
  pageNumber = 1,
  pageSize = 50,
): Promise<AppointmentDto[]> {
  const { data } = await api.get<PagedResult<AppointmentDto>>(
    `/appointments/doctor/${doctorId}`,
    { params: { date, pageNumber, pageSize } },
  )
  return data.items
}

export async function cancelAppointment(appointmentId: number): Promise<void> {
  await api.delete(`/appointments/${appointmentId}/cancel`)
}

export async function completeAppointment(appointmentId: number): Promise<void> {
  await api.put(`/appointments/${appointmentId}/complete`, {
    appointmentId,
  })
}

export async function rescheduleAppointment(
  command: RescheduleAppointmentCommand,
): Promise<void> {
  await api.put(`/appointments/${command.appointmentId}/reschedule`, command)
}

export async function rateDoctor(command: RateDoctorCommand): Promise<number> {
  const { data } = await api.post<number>(
    `/appointments/${command.appointmentId}/rate`,
    command,
  )
  return data
}
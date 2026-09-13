// ── Auth ────────────────────────────────────────────
export interface AuthResultDto {
  accessToken: string
  refreshToken: string
}

export interface LoginCommand {
  email: string
  password: string
}

export interface RegisterCommand {
  fullName: string
  email: string
  password: string
  dateOfBirth: string // yyyy-MM-ddThh:mm:ss
}

export interface RefreshTokenCommand {
  refreshToken: string
}

// ── Common / Paging ────────────────────────────────
export interface PagedResult<T> {
  items: T[]
  pageNumber: number
  pageSize: number
  totalCount: number
  totalPages: number
  hasPreviousPage: boolean
  hasNextPage: boolean
}

// ── Specializations ─────────────────────────────────
export interface SpecializationDto {
  id: number
  name: string
}

export interface CreateSpecializationCommand {
  name: string
}

// ── Doctors ─────────────────────────────────────────
export interface DoctorDto {
  id: number
  fullName: string
  specializationName: string
  consultationFee: number
}

export interface AvailableSlotDto {
  startTime: string
  endTime: string
}

export interface DoctorRatingDto {
  patientName: string
  score: number
  comment: string | null
  createdAt: string
}

export interface DoctorRatingsSummaryDto {
  averageScore: number
  totalRatings: number
  ratings: DoctorRatingDto[]
}

export interface CreateDoctorCommand {
  fullName: string
  email: string
  password: string
  specializationId: number
  consultationFee: number
}

export interface AddWorkingHourCommand {
  doctorId: number
  dayOfWeek: number // 0-6 (Sunday=0)
  startTime: string // HH:mm:ss
  endTime: string // HH:mm:ss
  slotDurationMinutes: number
}

export interface AddUnavailabilityCommand {
  doctorId: number
  date: string // yyyy-MM-dd
  reason: string | null
}

// ── Patients ────────────────────────────────────────
export interface CurrentPatientDto {
  id: number
  fullName: string
}

export interface CreatePatientCommand {
  fullName: string
  email: string
  password: string
}

// ── Appointments ────────────────────────────────────
export const AppointmentStatus = {
  Pending: 1,
  Confirmed: 2,
  Completed: 3,
  Cancelled: 4,
  NoShow: 5,
} as const

export type AppointmentStatusValue = (typeof AppointmentStatus)[keyof typeof AppointmentStatus]

export interface AppointmentDto {
  id: number
  doctorName: string
  patientName: string
  appointmentDateTime: string
  status: AppointmentStatusValue
  notes: string | null
}

export interface CreateAppointmentCommand {
  doctorId: number
  patientId: number
  appointmentDateTime: string
}

export interface RescheduleAppointmentCommand {
  appointmentId: number
  newDateTime: string
}

export interface RateDoctorCommand {
  appointmentId: number
  score: number
  comment: string | null
}

// ── Roles ───────────────────────────────────────────
export type Role = 'Admin' | 'Doctor' | 'Patient'

export interface AppUser {
  id: string
  email: string
  role: Role
}
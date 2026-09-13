import { AppointmentStatus } from '../types'

export const STATUS_LABELS: Record<number, string> = {
  [AppointmentStatus.Pending]: 'معلق',
  [AppointmentStatus.Confirmed]: 'مؤكد',
  [AppointmentStatus.Completed]: 'مكتمل',
  [AppointmentStatus.Cancelled]: 'ملغي',
  [AppointmentStatus.NoShow]: 'لم يحضر',
}

export const STATUS_ACCENT: Record<number, string> = {
  [AppointmentStatus.Pending]: 'border-warning-400',
  [AppointmentStatus.Confirmed]: 'border-primary-400',
  [AppointmentStatus.Completed]: 'border-success-400',
  [AppointmentStatus.Cancelled]: 'border-neutral-300',
  [AppointmentStatus.NoShow]: 'border-danger-300',
}
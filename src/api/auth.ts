import type {
  AuthResultDto,
  LoginCommand,
  RefreshTokenCommand,
  RegisterCommand,
} from '../types'
import { api } from './client'

export async function login(command: LoginCommand): Promise<AuthResultDto> {
  const { data } = await api.post<AuthResultDto>('/auth/login', command)
  return data
}

export async function register(command: RegisterCommand): Promise<number> {
  const { data } = await api.post<{ patientId: number }>('/auth/register', command)
  return data.patientId
}

export async function refresh(command: RefreshTokenCommand): Promise<AuthResultDto> {
  const { data } = await api.post<AuthResultDto>('/auth/refresh', command)
  return data
}
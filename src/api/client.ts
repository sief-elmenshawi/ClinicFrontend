import axios, { AxiosError } from 'axios'
import {
  accessTokenCache,
  clearAuth,
  refreshTokenCache,
  saveAccessToken,
  saveRefreshToken,
} from '../stores/auth'

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? ''

export const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = accessTokenCache()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

let refreshing: Promise<string> | null = null

async function refreshAccessToken(): Promise<string> {
  const refreshToken = refreshTokenCache()
  if (!refreshToken) throw new Error('no-refresh-token')

  const { data } = await axios.post<{ accessToken: string; refreshToken: string }>(
    `${API_BASE_URL}/api/auth/refresh`,
    { refreshToken },
  )
  saveAccessToken(data.accessToken)
  saveRefreshToken(data.refreshToken)
  return data.accessToken
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as (typeof error.config & { _retry?: boolean }) | undefined
    const status = error.response?.status

    // Business errors (400) and rate limit (429) pass through for the UI to show
    if (!original || !status || status !== 401) {
      return Promise.reject(error)
    }

    if (original._retry) {
      clearAuth()
      return Promise.reject(error)
    }

    original._retry = true

    try {
      if (!refreshing) {
        refreshing = refreshAccessToken().finally(() => {
          refreshing = null
        })
      }
      const newToken = await refreshing
      original.headers.Authorization = `Bearer ${newToken}`
      return api(original)
    } catch {
      clearAuth()
      return Promise.reject(error)
    }
  },
)

// Extract a readable message from the API error
export function getApiError(error: unknown, fallback = 'حصل خطأ غير متوقع'): string {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status
    if (status === 429) return 'عدد كبير من المحاولات، حاول بعد دقيقة'
    const data = error.response?.data
    if (typeof data === 'string') return data
    if (data && typeof data === 'object') {
      const detail =
        (data as { detail?: string }).detail ??
        (data as { error?: string }).error ??
        (data as { title?: string }).title
      if (detail) return detail
    }
    return error.message
  }
  return fallback
}
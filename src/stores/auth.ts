import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AppUser, AuthResultDto } from '../types'

interface AuthState {
  accessToken: string | null
  refreshToken: string | null
  user: AppUser | null
  setTokens: (tokens: AuthResultDto) => void
  setUser: (user: AppUser) => void
  setAccessToken: (token: string) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      setTokens: (tokens) =>
        set({
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          user: decodeUser(tokens.accessToken),
        }),
      setUser: (user) => set({ user }),
      setAccessToken: (token) =>
        set({ accessToken: token, user: decodeUser(token) }),
      logout: () =>
        set({ accessToken: null, refreshToken: null, user: null }),
    }),
    {
      name: 'clinic.auth',
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        user: state.user,
      }),
    },
  ),
)

function decodeUser(token: string): AppUser | null {
  try {
    const payload = token.split('.')[1]
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/')
    const decoded = JSON.parse(
      decodeURIComponent(
        Array.prototype.map
          .call(atob(base64), (c) => '%' + c.charCodeAt(0).toString(16).padStart(2, '0'))
          .join(''),
      ),
    )

    // ASP.NET Core JWT claims
    const role = decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role']
    const nameIdentifier =
      decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier']
    const email =
      decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress']

    return {
      id: nameIdentifier ?? '',
      email: email ?? decoded.email ?? '',
      role: role ?? 'Patient',
    }
  } catch {
    return null
  }
}

export const accessTokenCache = () => useAuthStore.getState().accessToken
export const saveAccessToken = (token: string) =>
  useAuthStore.getState().setAccessToken(token)
export const refreshTokenCache = () => useAuthStore.getState().refreshToken
export const clearAuth = () => useAuthStore.getState().logout()
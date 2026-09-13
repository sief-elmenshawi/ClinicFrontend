import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuthStore } from '../stores/auth'
import type { Role } from '../types'
import { FullPageSpinner } from '../components/ui/spinner'

function protectedHome(role: Role | undefined): string {
  return role === 'Admin' ? '/admin' : role === 'Doctor' ? '/doctor' : '/patient'
}

export function RequireAuth() {
  const accessToken = useAuthStore((s) => s.accessToken)
  const user = useAuthStore((s) => s.user)
  const location = useLocation()

  if (!accessToken) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }
  if (!user) {
    return <FullPageSpinner message="جاري تحميل الجلسة..." />
  }
  return <Outlet />
}

export function RequireRole({ role }: { role: Role }) {
  const user = useAuthStore((s) => s.user)
  const accessToken = useAuthStore((s) => s.accessToken)

  if (!accessToken) {
    return <Navigate to="/login" replace />
  }
  if (!user) {
    return <FullPageSpinner message="جاري تحميل الجلسة..." />
  }
  if (user.role !== role) {
    return <Navigate to={protectedHome(user.role)} replace />
  }
  return <Outlet />
}

export function RedirectIfAuthed() {
  const user = useAuthStore((s) => s.user)
  if (user) {
    return <Navigate to={protectedHome(user.role)} replace />
  }
  return <Outlet />
}
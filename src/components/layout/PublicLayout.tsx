import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { HeartPulse, LayoutDashboard, LogIn, Menu, UserPlus, X } from 'lucide-react'
import { useState } from 'react'
import { useAuthStore } from '../../stores/auth'
import { cn } from '../../lib/utils'
import { Button } from '../ui/button'

export function PublicLayout() {
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  const homePath =
    user?.role === 'Admin'
      ? '/admin'
      : user?.role === 'Doctor'
        ? '/doctor'
        : user?.role === 'Patient'
          ? '/patient'
          : '/'

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 glass border-b border-neutral-200/60">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 shadow-lg shadow-primary-500/30">
              <HeartPulse className="h-5 w-5 text-white" />
            </span>
            <span className="text-xl font-extrabold text-gradient">عيادة</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-2 text-sm md:flex">
            <NavLink
              to="/"
              className={({ isActive }) =>
                cn(
                  'rounded-full px-4 py-1.5 font-semibold transition-colors',
                  isActive
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900',
                )
              }
            >
              الرئيسية
            </NavLink>

            {!user && (
              <>
                <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>
                  <LogIn className="h-4 w-4" />
                  تسجيل الدخول
                </Button>
                <Button size="sm" onClick={() => navigate('/register')}>
                  <UserPlus className="h-4 w-4" />
                  حساب جديد
                </Button>
              </>
            )}
            {user && (
              <>
                <Button size="sm" onClick={() => navigate(homePath)}>
                  <LayoutDashboard className="h-4 w-4" />
                  لوحتي
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    logout()
                    navigate('/')
                  }}
                >
                  خروج
                </Button>
              </>
            )}
          </nav>

          {/* Mobile toggle */}
          <button
            onClick={() => setOpen((v) => !v)}
            className="rounded-xl p-2 text-neutral-600 transition-colors hover:bg-neutral-100 md:hidden"
            aria-label="القائمة"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile menu */}
        {open && (
          <div className="animate-fade-in-up border-t border-neutral-100 bg-white px-4 pb-4 pt-2 shadow-xl md:hidden">
            <NavLink
              to="/"
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                cn(
                  'block rounded-xl px-3 py-2.5 text-sm font-semibold',
                  isActive ? 'bg-primary-50 text-primary-700' : 'text-neutral-700',
                )
              }
            >
              الرئيسية
            </NavLink>
            {!user && (
              <div className="mt-2 flex flex-col gap-2">
                <Button className="w-full" size="sm" onClick={() => { navigate('/login'); setOpen(false) }}>
                  <LogIn className="h-4 w-4" />
                  تسجيل الدخول
                </Button>
                <Button className="w-full" size="sm" variant="soft" onClick={() => { navigate('/register'); setOpen(false) }}>
                  <UserPlus className="h-4 w-4" />
                  حساب جديد
                </Button>
              </div>
            )}
            {user && (
              <div className="mt-2 flex flex-col gap-2">
                <Button className="w-full" size="sm" onClick={() => { navigate(homePath); setOpen(false) }}>
                  <LayoutDashboard className="h-4 w-4" />
                  لوحتي
                </Button>
                <Button
                  className="w-full"
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    logout()
                    navigate('/')
                    setOpen(false)
                  }}
                >
                  خروج
                </Button>
              </div>
            )}
          </div>
        )}
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8 animate-fade-in">
        <Outlet />
      </main>
    </div>
  )
}
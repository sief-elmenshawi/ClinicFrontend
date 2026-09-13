import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  CalendarDays,
  ClipboardList,
  HeartPulse,
  LogOut,
  Menu,
  Stethoscope,
  Tags,
} from 'lucide-react'
import { useState } from 'react'
import { useAuthStore } from '../../stores/auth'
import { cn } from '../../lib/utils'
import type { Role } from '../../types'
import { Avatar } from '../ui/avatar'

const NAV_ITEMS: Record<Role, { to: string; label: string; icon: typeof Tags }[]> = {
  Admin: [
    { to: '/admin', label: 'لوحة التحكم', icon: Tags },
    { to: '/admin/doctors', label: 'الأطباء', icon: Stethoscope },
    { to: '/admin/specializations', label: 'التخصصات', icon: Tags },
  ],
  Doctor: [{ to: '/doctor', label: 'جدول الحجوزات', icon: CalendarDays }],
  Patient: [{ to: '/patient', label: 'حجوزاتي', icon: ClipboardList }],
}

const TITLES: Record<Role, string> = {
  Admin: 'لوحة الأدمن',
  Doctor: 'لوحة الطبيب',
  Patient: 'لوحة المريض',
}

export function ProtectedLayout({ role }: { role: Role }) {
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  const items = NAV_ITEMS[role]

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 start-0 z-30 flex w-64 flex-col border-e border-neutral-200/70 bg-white transition-transform duration-300',
          'lg:static lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        )}
      >
        {/* Brand */}
        <div className="flex h-16 items-center gap-2.5 border-b border-neutral-100 px-5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 shadow-lg shadow-primary-500/30">
            <HeartPulse className="h-5 w-5 text-white" />
          </span>
          <span className="text-xl font-extrabold text-gradient">عيادة</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-1 p-3">
          <p className="mb-1 px-3 pt-1 text-[11px] font-bold uppercase tracking-wider text-neutral-400">
            {TITLES[role]}
          </p>
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/admin' || item.to === '/doctor' || item.to === '/patient'}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-200',
                  isActive
                    ? 'bg-primary-50 text-primary-700 shadow-sm shadow-primary-100/60'
                    : 'text-neutral-500 hover:bg-neutral-50 hover:text-neutral-800',
                )
              }
            >
              <item.icon className="h-[18px] w-[18px]" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* User footer */}
        <div className="border-t border-neutral-100 p-4">
          <div className="mb-3 flex items-center gap-3 overflow-hidden rounded-xl bg-neutral-50 px-3 py-2.5">
            {user && <Avatar name={user.email} size="sm" />}
            <p className="truncate text-xs font-medium text-neutral-600">{user?.email}</p>
          </div>
          <button
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-danger-600 transition-colors hover:bg-danger-50"
            onClick={() => {
              logout()
              navigate('/')
            }}
          >
            <LogOut className="h-4 w-4" />
            تسجيل الخروج
          </button>
        </div>
      </aside>

      {/* Backdrop for mobile */}
      {open && (
        <div
          className="fixed inset-0 z-20 bg-black/30 backdrop-blur-sm transition-opacity lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Content */}
      <div className="flex-1 min-w-0">
        <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-neutral-200/70 bg-white/80 px-4 backdrop-blur lg:hidden">
          <button
            onClick={() => setOpen((v) => !v)}
            className="rounded-xl p-2 text-neutral-600 transition-colors hover:bg-neutral-100"
            aria-label="القائمة"
          >
            <Menu className="h-5 w-5" />
          </button>
          <span className="text-sm font-bold text-neutral-800">{TITLES[role]}</span>
        </header>
        <main className="mx-auto max-w-5xl p-4 lg:p-8 animate-fade-in">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
import { lazy, Suspense } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { ProtectedLayout } from './components/layout/ProtectedLayout'
import { PublicLayout } from './components/layout/PublicLayout'
import { RedirectIfAuthed, RequireRole } from './routes/guards'
import { FullPageSpinner } from './components/ui/spinner'
import { ToastProvider } from './components/ui/toast'

const HomePage = lazy(() => import('./pages/Home').then((m) => ({ default: m.HomePage })))
const LoginPage = lazy(() => import('./pages/Login').then((m) => ({ default: m.LoginPage })))
const RegisterPage = lazy(() =>
  import('./pages/Register').then((m) => ({ default: m.RegisterPage })),
)
const SpecializationDoctorsPage = lazy(() =>
  import('./pages/SpecializationDoctors').then((m) => ({ default: m.SpecializationDoctorsPage })),
)
const DoctorProfilePage = lazy(() =>
  import('./pages/DoctorProfile').then((m) => ({ default: m.DoctorProfilePage })),
)
const MyAppointmentsPage = lazy(() =>
  import('./pages/patient/MyAppointments').then((m) => ({ default: m.MyAppointmentsPage })),
)
const DoctorSchedulePage = lazy(() =>
  import('./pages/doctor/MySchedule').then((m) => ({ default: m.DoctorSchedulePage })),
)
const DashboardPage = lazy(() =>
  import('./pages/admin/Dashboard').then((m) => ({ default: m.DashboardPage })),
)
const ManageDoctorsPage = lazy(() =>
  import('./pages/admin/ManageDoctors').then((m) => ({ default: m.ManageDoctorsPage })),
)
const ManageSpecializationsPage = lazy(() =>
  import('./pages/admin/ManageSpecializations').then((m) => ({
    default: m.ManageSpecializationsPage,
  })),
)

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ToastProvider>
          <Suspense fallback={<FullPageSpinner message="جاري تحميل الصفحة..." />}>
          <Routes>
          <Route element={<PublicLayout />}>
            <Route index element={<HomePage />} />
            <Route path="specializations/:specializationId" element={<SpecializationDoctorsPage />} />
            <Route path="doctors/:doctorId" element={<DoctorProfilePage />} />
          </Route>

          <Route element={<RedirectIfAuthed />}>
            <Route path="login" element={<LoginPage />} />
            <Route path="register" element={<RegisterPage />} />
          </Route>

          <Route path="patient" element={<RequireRole role="Patient" />}>
            <Route element={<ProtectedLayout role="Patient" />}>
              <Route index element={<MyAppointmentsPage />} />
            </Route>
          </Route>

          <Route path="doctor" element={<RequireRole role="Doctor" />}>
            <Route element={<ProtectedLayout role="Doctor" />}>
              <Route index element={<DoctorSchedulePage />} />
            </Route>
          </Route>

          <Route path="admin" element={<RequireRole role="Admin" />}>
            <Route element={<ProtectedLayout role="Admin" />}>
              <Route index element={<DashboardPage />} />
              <Route path="doctors" element={<ManageDoctorsPage />} />
              <Route path="specializations" element={<ManageSpecializationsPage />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        </Suspense>
        </ToastProvider>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
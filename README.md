# 🏥 عيادة — الفرونت

واجهة المستخدم لنظام حجز مواعيد العيادة، مبنية بـ **React + TypeScript + Vite + Tailwind CSS v4**.

## التقنيات
- **Vite + React 19 + TypeScript**
- **TanStack Query** — إدارة الـ server state
- **Axios** — مع interceptor لإعادة إرسال الطلبات بعد تجديد الـ JWT تلقائيًا
- **Zustand** — تخزين حالة الـ Auth (persisted في localStorage)
- **React Hook Form + Zod** — التحقق من الـ Forms
- **React Router** — مع guards حسب الـ role (Admin / Doctor / Patient)
- واجهة **RTL** بالعربي بالكامل

## التشغيل

```bash
# 1) شغّل الـ API أولًا
cd D:\Assignment\Clinic.APISolution
dotnet run --project Clinic.API

# 2) ثم شغّل الفرونت
cd D:\Assignment\assignment
npm install
npm run dev
```

الـ dev server بيعمل proxy لأي طلب `/api/*` إلى `http://localhost:5136`، فمفيش أي مشكلة CORS حتى لو تغيّر البورت.

> لو حبيت تشاور على الـ API مباشرة من غير proxy، اعمل ملف `.env` وفيه:
> `VITE_API_BASE_URL=http://localhost:5136`

## الأدوار
| الحساب | التدفق |
|---|---|
| **Admin** | `/admin` — التحكم في التخصصات والأطباء وساعات العمل والإجازات |
| **Doctor** | `/doctor` — جدول الحجوزات + تأكيد الكشف |
| **Patient** | `/patient` — حجوزاتي + تأجيل + إلغاء + تقييم |

حساب الأدمن الافتراضي: `admin@clinic.com` / `Admin@123`

## الأوامر
```bash
npm run dev     # بيئة تطوير
npm run build   # بناء الإنتاج (tsc + vite)
npm run lint    # فحص Oxlint
npm run preview # معاينة النسخة المبنية
```
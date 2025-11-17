# Comprehensive Codebase Analysis Report
**Project:** Little Garden Kindergarten Platform  
**Date:** November 17, 2025  
**Status:** Full Integration Audit

---

## TABLE OF CONTENTS
1. [Frontend Pages Overview](#1-frontend-pages-overview)
2. [Backend Models & Routes](#2-backend-models--routes)
3. [Frontend-Backend Mismatches](#3-frontendbackend-mismatches)
4. [Integration Gaps](#4-integration-gaps)
5. [API URL Inconsistencies](#5-api-url-inconsistencies)
6. [Critical Issues Summary](#6-critical-issues-summary)

---

## 1. FRONTEND PAGES OVERVIEW

### 1.1 Public Pages (No Auth Required)

#### **`frontend/app/page.js` (Login Page)**
- **Path:** `/` (root)
- **Data Displayed:**
  - Login form with username/password
  - Google login button
  - Registration link
- **API Calls Made:**
  - `POST /api/auth/login` - Standard login
  - `GET /api/auth/google/login` - Google OAuth
- **Data Should Fetch But Doesn't:** None (login page is minimal)
- **Hardcoded Data:** None
- **Mock Data:** None
- **Status:** ✅ COMPLETE

#### **`frontend/app/register/page.js` (Registration Page)**
- **Path:** `/register`
- **Data Displayed:**
  - Registration form (email, username, password)
  - Error/success messages
- **API Calls Made:**
  - `POST /api/auth/register` - Create new account
- **Data Should Fetch But Doesn't:** None
- **Hardcoded Data:** None
- **Status:** ✅ COMPLETE

#### **`frontend/app/verify-email/page.js` (Email Verification)**
- **Path:** `/verify-email?status=pending&email=...`
- **Data Displayed:**
  - Status message based on verification result
  - Back to login button
- **API Calls Made:** None (URL params only)
- **Data Should Fetch But Doesn't:** None
- **Status:** ✅ COMPLETE

#### **`frontend/app/auth/google/callback/page.js` (Google Callback)**
- **Path:** `/auth/google/callback?token=...&username=...&role=...`
- **Data Displayed:**
  - Loading spinner during authentication
  - Error message if OAuth fails
- **API Calls Made:** None (token extraction from URL)
- **Data Should Fetch But Doesn't:** None
- **Status:** ✅ COMPLETE

#### **`frontend/app/umum/page.js` (Public Dashboard)**
- **Path:** `/umum`
- **Data Displayed:**
  - Hero section with static content
  - About section (hardcoded)
  - Curriculum section (hardcoded)
  - Features section
- **API Calls Made:** None
- **Data Should Fetch But Doesn't:**
  - ❌ School information (about, mission, vision)
  - ❌ Programs/curriculum details
  - ❌ Announcements
  - ❌ News/events
- **Hardcoded Data:**
  - All about/curriculum/vision/mission text is static
  - Images are placeholder paths
  - No dynamic content loading
- **Status:** ⚠️ INCOMPLETE - No backend integration

---

### 1.2 Protected Pages - User Authentication Required

#### **`frontend/app/profil/page.js` (User Profile)**
- **Path:** `/profil` (Protected)
- **Data Displayed:**
  - User email, username, role, registration date
- **API Calls Made:**
  - `GET /api/auth/me` - Fetch user profile
- **Data Should Fetch But Doesn't:** None (minimal page)
- **Status:** ✅ COMPLETE

#### **`frontend/app/ganti-password/page.js` (Change Password)**
- **Path:** `/ganti-password` (Protected)
- **Data Displayed:**
  - Password change form
- **API Calls Made:**
  - `POST /api/auth/change-password` - Update password
- **Data Should Fetch But Doesn't:** None
- **Status:** ✅ COMPLETE

---

### 1.3 Student Registration & Payment Pages

#### **`frontend/app/pendaftaran-anak/page.js` (Student Registration)**
- **Path:** `/pendaftaran-anak` (Protected)
- **Data Displayed:**
  - Student registration form with fields:
    - NIK (16 digits)
    - Name, DOB, Gender, Blood Type, Religion
    - Address
    - Parent name, phone number
    - Food allergies, health notes
    - Photo upload
- **API Calls Made:**
  - `POST /api/student/register` - Register student (with FormData for photo)
  - `POST /api/payment/checkout-by-nik` - Initiate payment
- **Data Should Fetch But Doesn't:** None (form-based page)
- **Hardcoded Data:** None
- **Status:** ✅ COMPLETE

#### **`frontend/app/riwayat-pembayaran/page.js` (Payment History)**
- **Path:** `/riwayat-pembayaran` (Protected)
- **Data Displayed:**
  - Table of payment transactions with:
    - Date, Student NIK, Order ID, Amount
    - Payment status (pending/settlement/failed/expire/cancel/deny)
    - Action button to continue payment if pending
- **API Calls Made:**
  - `GET /api/payment/my-payments` - Fetch user's payment history
  - `POST /api/payment/checkout-by-nik` - Retry payment
- **Data Should Fetch But Doesn't:** None
- **Field Mapping:**
  - Backend: `amount`, `status`, `studentNik`, `createdAt`
  - Frontend: expects `amount` as number, formats with `toLocaleString()`
  - ❌ **ISSUE:** Backend returns `redirectUrl`, but code expects `payment_url`
- **Status:** ⚠️ PARTIALLY COMPLETE - Field name mismatch

---

### 1.4 Admin Dashboard Pages

#### **`frontend/app/admin/page.js` (Admin Dashboard)**
- **Path:** `/admin` (Role: admin)
- **Data Displayed:**
  - Tab 1: Dashboard Stats (hardcoded)
    - Total Students: "43"
    - Total Active Classes: "5"
    - Total Active Teachers: "5"
    - Activities feed (hardcoded 4 items)
  - Tab 2: Notifications Management
    - Form to create notification
    - List of recent notifications
  - Tab 3: Schedule Management
    - Edit jadwal kelas (day of week + time slots)
    - Display saved schedules
  - Tab 4: Documentation KBM
    - Upload gallery photos with date
    - Display recent documentation
  - Tab 5: Attendance Management
    - Mark attendance by date
    - Student checkboxes (hardcoded 5 students)
    - View attendance history

- **API Calls Made:**
  - `GET /api/notification` - Fetch notifications
  - `POST /api/notification` - Create notification
  - `GET /api/activities` - Fetch activities/schedules
  - `POST /api/activities/jadwal` - Save schedule
  - `GET /api/gallery` - Fetch gallery/documentation
  - `POST /api/gallery/upload` - Upload documentation photo
  - `GET /api/attendance` - Fetch attendance records
  - `POST /api/attendance` - Create attendance record

- **Data Should Fetch But Doesn't:**
  - ❌ Stats should be calculated from DB, not hardcoded
  - ❌ Student list for attendance should come from backend
  - ❌ Teachers list should come from backend
  
- **Hardcoded Mock Data:**
  - `statsData` - 3 stat cards with fixed values
  - `activitiesData` - 4 activity items with fixed descriptions
  - `studentsList` - 5 hardcoded students for attendance
  - All "Tegretian peraturan informasi" descriptions

- **Status:** ⚠️ PARTIAL - Some calls implemented, but stats/lists hardcoded

---

### 1.5 Parent Dashboard Pages (Wali Murid)

#### **`frontend/app/wali-murid/dashboard/page.js` (Parent Dashboard)**
- **Path:** `/wali-murid/dashboard` (Role: parent)
- **Data Displayed:**
  - Greeting to parent
  - Mini schedule table (hardcoded columns: Jam, Senin, Selasa, Rabu)
  - Attendance percentage widget
  - Announcements section (hardcoded)
  - Teachers list (hardcoded 3 teachers)
  - Weather forecast (3-day forecast)
  - Documentation KBM carousel (2 latest photos)

- **API Calls Made:**
  - `GET /api/gallery` - Fetch documentation photos
  - `GET /api/attendance/my` - Fetch attendance percentage
  - `GET /api/weather` - Fetch weather forecast
  - `POST /api/feedback` - Submit feedback (modal)

- **Data Should Fetch But Doesn't:**
  - ❌ Full schedule from backend (using static `scheduleData`)
  - ❌ Announcements/news (hardcoded text)
  - ❌ Teachers list should come from backend
  - ❌ Child name (uses hardcoded "Nama Orangtua Murid")

- **Hardcoded Data:**
  - `scheduleData` - Full week schedule table
  - `teachersData` - 3 hardcoded teachers with photos
  - Announcements text
  - Default weather data (fallback in catch block)

- **Status:** ⚠️ PARTIAL - Some API calls implemented, but schedule/teachers/announcements hardcoded

#### **`frontend/app/wali-murid/jadwal/page.js` (Weekly Schedule)**
- **Path:** `/wali-murid/jadwal` (Role: parent)
- **Data Displayed:**
  - Schedule grid with columns: Jam, Senin, Selasa, Rabu
  - Activities for each time slot
- **API Calls Made:**
  - `GET /api/activities/jadwal?day=1|2|3` - Fetch schedule for each day
  - `POST /api/feedback` - Submit feedback
- **Data Should Fetch But Doesn't:** None (fetches properly, has fallback)
- **Fallback Data:**
  - `getDefaultSchedule()` returns hardcoded schedule if API fails
- **Status:** ⚠️ PARTIAL - Attempts API but has extensive hardcoded fallback

#### **`frontend/app/wali-murid/attendance/page.js` (Attendance Record)**
- **Path:** `/wali-murid/attendance` (Role: parent)
- **Data Displayed:**
  - Attendance percentage
  - Days present, absent, total
  - Grid of last 20 days with status (present/absent)
- **API Calls Made:**
  - `GET /api/attendance/my-details` - Fetch detailed attendance
- **Fallback Data:**
  - `generateDummyAttendance()` - 20 random present/absent records
- **Status:** ⚠️ PARTIAL - API implemented with good fallback

#### **`frontend/app/wali-murid/dokumentasi-kbm/page.js` (Documentation)**
- **Path:** `/wali-murid/dokumentasi-kbm` (Role: parent)
- **Data Displayed:**
  - 3-column table: Date, Photo, Notes
  - Gallery of KBM documentation
- **API Calls Made:**
  - `GET /api/gallery` - Fetch gallery/documentation
  - `POST /api/feedback` - Submit feedback
- **Data Mapping:**
  - ❌ **ISSUE:** Maps `doc.postedAt` or `doc.createdAt` → `date` (formatted)
  - ❌ **ISSUE:** Expects `imageUrl` but maps to `photo`
  - Uses `doc.caption` for notes
- **Status:** ⚠️ PARTIAL - API call exists but field mapping may fail

#### **`frontend/app/wali-murid/profil-anak/page.js` (Child Profile)**
- **Path:** `/wali-murid/profil-anak` (Role: parent)
- **Data Displayed:**
  - Child photo
  - Child personal data:
    - Name, DOB, Address
    - Blood type, Gender, Religion
    - Status
- **API Calls Made:**
  - `GET /api/student/my?showNik=1` - Fetch parent's children
- **Data Mapping:**
  - Uses `child.nama`, `child.tanggalLahir`, `child.alamat`, `child.golonganDarah`, `child.jenisKelamin`, `child.agama`, `child.status`
  - Photos from `child.photoUrl` with fallback to `/child-photo.jpg`
- **Status:** ✅ COMPLETE

#### **`frontend/app/wali-murid/feedback/page.js` (Feedback Form)**
- **Path:** `/wali-murid/feedback` (Role: parent)
- **Data Displayed:**
  - Textarea for feedback input
  - Submit button
- **API Calls Made:**
  - `POST /api/feedback` - Submit feedback
- **Status:** ✅ COMPLETE

---

## 2. BACKEND MODELS & ROUTES

### 2.1 Models

#### **User Model** (`backend/src/models/User.js`)
```
- _id: ObjectId
- email: String (required, unique)
- username: String (required, unique)
- password: String (hashed, required)
- role: Enum ['user', 'parent', 'admin', 'teacher'] (default: 'user')
- googleId: String (optional, for OAuth)
- isVerified: Boolean (default: false)
- timestamps: {createdAt, updatedAt}
```
- **Used By:** Auth routes
- **Status:** ✅

#### **Student Model** (`backend/src/models/Student.js`)
```
- _id: ObjectId
- nik: String (required, unique, 16 digits, indexed)
- nama: String (required)
- tanggalLahir: Date (required)
- alamat: String (required)
- golonganDarah: Enum ['A','B','AB','O']
- jenisKelamin: Enum ['Laki-Laki', 'Perempuan']
- agama: String
- namaOrangtua: String
- noHPOrangtua: String
- photoUrl: String
- alergiMakanan: String
- catatanKesehatan: String
- anakKe: Number
- parentUserId: ObjectId (ref User)
- status: Enum ['pending','active','rejected'] (default: 'pending')
- kelas: Enum ['A', 'B', null] (default: null, indexed)
- paymentStatus: Enum ['unpaid','partial','paid'] (default: 'unpaid')
- timestamps: {createdAt, updatedAt}
```
- **Used By:** Student routes, Parent dashboard
- **Status:** ✅

#### **Payment Model** (`backend/src/models/Payment.js`)
```
- _id: ObjectId
- userId: ObjectId (ref User, required)
- studentNik: String (required, indexed)
- orderId: String (required, unique)
- amount: Number (required)
- status: Enum ['pending','settlement','failed','expire','cancel','deny'] (default: 'pending')
- redirectUrl: String
- timestamps: {createdAt, updatedAt}
```
- **Used By:** Payment routes
- **Issue:** Frontend expects `payment_url`, backend returns `redirectUrl` ❌
- **Status:** ⚠️

#### **Attendance Model** (`backend/src/models/Attendance.js`)
```
- _id: ObjectId
- name: String
- date: Date
- status: String ('Hadir' | 'Tidak Hadir' | 'Izin')
- (other fields unknown - not shown in provided code)
```
- **Used By:** Attendance routes
- **Issue:** Schema unclear from code; routes show mismatch with FE expectations ❌
- **Status:** ⚠️

#### **Gallery Model** (`backend/src/models/Gallery.js`)
```
- _id: ObjectId
- caption: String (required)
- imageUrl: String (required)
- postedAt: Date (default: now)
- isVisible: Boolean (default: false)
```
- **Used By:** Gallery routes, Documentation display
- **Issue:** Frontend expects `date` field, backend has `postedAt` ❌
- **Status:** ⚠️

#### **Notification Model** (`backend/src/models/Notification.js`)
```
- _id: ObjectId
- title: String (required)
- body: String (required)
- audience: Enum ['all', 'parents', 'byUser'] (required)
- recipients: [ObjectId] (ref User, only used if audience='byUser')
- createdBy: ObjectId (ref User)
- readBy: [ObjectId] (ref User)
- timestamps: {createdAt, updatedAt}
```
- **Used By:** Notification routes, Real-time events
- **Status:** ✅

#### **Feedback Model** (`backend/src/models/Feedback.js`)
```
(Structure not provided, but assumed to have):
- _id: ObjectId
- userId: ObjectId (ref User)
- feedback: String
- timestamps: {createdAt, updatedAt}
```
- **Used By:** Feedback routes
- **Status:** Unknown

#### **Activity/ActivityLog Models** (`backend/src/models/Activity.js`, `ActivityLog.js`)
```
(Structure not provided in detail, but routes suggest):
- Schedule: className, dayOfWeek, slots: [{start, end, title, note}]
- ActivityLog: dailySchedule with time slots and photos
```
- **Used By:** Activity routes, Schedule management
- **Status:** Unknown

#### **Weather Model**
- **Status:** ❌ NO MODEL - Weather data fetched from external API

---

### 2.2 Routes & Endpoints

#### **Auth Routes** (`backend/src/routes/auth.js`)
| Method | Endpoint | Auth Required | Role | Purpose | Status |
|--------|----------|---------------|------|---------|--------|
| POST | `/api/auth/register` | ❌ No | - | User registration | ✅ |
| POST | `/api/auth/login` | ❌ No | - | User login | ✅ |
| GET | `/api/auth/me` | ✅ Yes | Any | Get current user profile | ✅ |
| POST | `/api/auth/change-password` | ✅ Yes | Any | Change password | ✅ |
| GET | `/api/auth/verify-email` | ❌ No | - | Verify email via link | ✅ |
| GET | `/api/auth/google/login` | ❌ No | - | Google OAuth login | ✅ |
| GET | `/api/auth/google/register` | ❌ No | - | Google OAuth register | ✅ |
| GET | `/api/auth/google/callback` | ❌ No | - | Google OAuth callback | ✅ |

**Missing Endpoints:**
- ❌ `POST /api/auth/logout` - No logout endpoint
- ❌ `POST /api/auth/forgot-password` - No password recovery

---

#### **Student Routes** (`backend/src/routes/student.js`)
| Method | Endpoint | Auth | Role | Purpose | Status |
|--------|----------|------|------|---------|--------|
| POST | `/api/student/register` | ✅ | user/parent/admin | Register child | ✅ |
| GET | `/api/student/my` | ✅ | parent/admin | Get my children | ✅ |
| PATCH | `/api/student/:id` | ✅ | parent/admin | Update child data | ✅ |

**Missing Endpoints:**
- ❌ `GET /api/student/:id` - Get specific student details
- ❌ `GET /api/student/search` - Search students (admin)
- ❌ `DELETE /api/student/:id` - Delete student (admin)
- ❌ `GET /api/student/class/:class` - Get students by class (admin)

---

#### **Attendance Routes** (`backend/src/routes/attendance.js`)
| Method | Endpoint | Auth | Role | Purpose | Status |
|--------|----------|------|------|---------|--------|
| GET | `/api/attendance` | ✅ | admin/teacher | Get all attendance | ✅ |
| GET | `/api/attendance/my` | ✅ | parent/admin | Get my attendance summary | ✅ |
| GET | `/api/attendance/my-details` | ✅ | parent/admin | Get detailed attendance | ✅ |
| POST | `/api/attendance` | ✅ | admin/teacher | Create attendance record | ✅ |

**Issues:**
- ❌ Status values: Backend uses 'Hadir'/'Tidak Hadir', frontend expects 'present'/'absent'
- ❌ Data structure mismatch: FE sends `{date, studentIds: []}`, BE unclear
- ❌ No attendance calculation logic in GET endpoints

---

#### **Gallery Routes** (`backend/src/routes/gallery.js`)
| Method | Endpoint | Auth | Role | Purpose | Status |
|--------|----------|------|------|---------|--------|
| GET | `/api/gallery` | ✅ | Any | Get visible photos | ✅ |
| POST | `/api/gallery/upload` | ✅ | admin/teacher | Upload photo | ✅ |
| GET | `/api/gallery/search` | ✅ | admin | Search by caption | ⚠️ |
| PATCH | `/api/gallery/:id/toggle` | ✅ | admin | Toggle visibility | ⚠️ |

**Issues:**
- ❌ Field name: Backend `postedAt`, frontend uses `createdAt` or `date`
- ❌ Image field: Backend returns `imageUrl`, gallery upload expects `photo` in body
- ⚠️ Search route uses query params but POST routes need it

---

#### **Payment Routes** (`backend/src/routes/payment.js`)
| Method | Endpoint | Auth | Role | Purpose | Status |
|--------|----------|------|------|---------|--------|
| POST | `/api/payment/checkout-by-nik` | ✅ | Any | Initiate payment by NIK | ✅ |
| POST | `/api/payment/callback` | ❌ No | - | Midtrans webhook callback | ✅ |
| GET | `/api/payment/my-payments` | ✅ | Any | Get user's payment history | ✅ |

**Issues:**
- ❌ Response field: FE expects `payment_url`, BE returns `redirectUrl`

---

#### **Feedback Routes** (`backend/src/routes/feedback.js`)
| Method | Endpoint | Auth | Role | Purpose | Status |
|--------|----------|------|------|---------|--------|
| POST | `/api/feedback` | ✅ | parent | Submit feedback | ✅ |
| GET | `/api/feedback` | ✅ | admin/teacher | List all feedback | ✅ |
| GET | `/api/feedback/my` | ✅ | parent | List my feedback | ✅ |

**Status:** ✅ Complete

---

#### **Activities Routes** (`backend/src/routes/activities.js`)
| Method | Endpoint | Auth | Role | Purpose | Status |
|--------|----------|------|------|---------|--------|
| POST | `/api/activities/jadwal` | ✅ | admin/teacher | Set day schedule | ⚠️ |
| GET | `/api/activities/jadwal` | ❌ No | - | Get schedule template | ⚠️ |
| GET | `/api/activities/daily` | ❌ No | - | Get daily schedule log | ⚠️ |
| GET | `/api/activities/current` | ✅ | parent/admin/teacher | What's happening now | ❌ |
| POST | `/api/activities/daily/:logId/slots/:slotId/photos` | ✅ | admin/teacher | Upload slot photos | ⚠️ |
| DELETE | `/api/activities/daily/:logId/slots/:slotId/photos/:photoId` | ✅ | admin/teacher | Delete slot photo | ⚠️ |
| PATCH | `/api/activities/daily/:logId/slots/:slotId/photos/:photoId` | ✅ | admin/teacher | Update photo caption | ⚠️ |

**Issues:**
- ⚠️ Routes exist but implementation quality unknown
- ❌ `/api/activities/current` not called by any frontend page

---

#### **Notification Routes** (`backend/src/routes/notification.js`)
| Method | Endpoint | Auth | Role | Purpose | Status |
|--------|----------|------|------|---------|--------|
| POST | `/api/notification` | ✅ | admin | Create notification | ✅ |
| GET | `/api/notification/my` | ✅ | Any | Get my notifications | ✅ |
| PATCH | `/api/notification/:id/read` | ✅ | Any | Mark as read | ✅ |
| GET | `/api/notification` | ✅ | admin | List all notifications | ✅ |
| GET | `/api/notification/stream` | ✅ | Any | Real-time SSE stream | ✅ |

**Status:** ✅ Complete with real-time support

---

#### **Weather Routes** (`backend/src/routes/weather.js`)
| Method | Endpoint | Auth | Role | Purpose | Status |
|--------|----------|------|------|---------|--------|
| GET | `/api/weather` | ❌ No | - | Get weather forecast | ✅ |

**Issues:**
- ⚠️ Frontend expects specific data format: `{lokasi, data_cuaca: [{tanggal, kota, suhu_max, suhu_min, kondisi, icon, persentase_hujan}]}`
- Unknown if backend returns this format

---

#### **Message Routes** (`backend/src/routes/messages.js`)
| Method | Endpoint | Auth | Role | Purpose | Status |
|--------|----------|------|------|---------|--------|
| POST | `/api/message/send` | ✅ | Any | Send message | ❌ |
| GET | `/api/message/inbox` | ✅ | Any | Get inbox messages | ❌ |

**Issues:**
- ❌ **NOT USED BY FRONTEND** - No messaging pages exist
- Routes are dead code

---

## 3. FRONTEND-BACKEND MISMATCHES

### 3.1 Critical Mismatches

#### **MISMATCH #1: Gallery/Documentation Data Structure**

**Frontend Expects** (in `wali-murid/dokumentasi-kbm/page.js`):
```javascript
{
  id: string,
  date: "Senin, 28 Agustus 2025", // Formatted date
  photo: string (URL),
  notes: string
}
```

**Backend Provides** (`gallery.js` model):
```javascript
{
  _id: ObjectId,
  caption: string,
  imageUrl: string,
  postedAt: Date,
  isVisible: boolean
}
```

**Mapping Issues:**
- ❌ `doc._id` → `doc.id` (needs conversion)
- ❌ `doc.postedAt` or `doc.createdAt` → `doc.date` (formatted differently)
- ❌ `doc.imageUrl` → `doc.photo` (field name mismatch)
- ✅ `doc.caption` → `doc.notes` (works)

**Admin Dashboard** (`admin/page.js`):
```javascript
// Expects:
doc.imageUrl, doc.createdAt
// Backend provides:
imageUrl ✅, postedAt ❌ (should be createdAt)
```

**Fix Required:** Standardize field names across frontend

---

#### **MISMATCH #2: Attendance Status Enum**

**Frontend** (in `wali-murid/attendance/page.js`):
```javascript
record.status === 'present' ? '✓ Hadir' : '✗ Tidak Hadir'
```

**Backend Model** (Attendance.js):
```javascript
status: String ('Hadir' | 'Tidak Hadir' | 'Izin')
```

**Issue:** Frontend checks for `'present'` but backend stores `'Hadir'`
- Frontend needs to map: `'Hadir'` → `'present'`, `'Tidak Hadir'` → `'absent'`
- Or backend needs to return English status

**Admin Attendance** (admin/page.js):
```javascript
POST body: {date, studentIds: [1,2,3]}
```
But backend Attendance model expects individual records with `name` and `date`.

**Fix Required:** Standardize enum values

---

#### **MISMATCH #3: Payment Redirect URL Field Name**

**Frontend** (riwayat-pembayaran/page.js):
```javascript
if (data.payment_url) {
  window.open(data.payment_url, "_blank");
}
```

**Backend** (Payment model and checkoutByNik):
```javascript
Payment {
  redirectUrl: String
}
// Response likely returns:
{ redirectUrl: "..." }
```

**Issue:** Response field name mismatch
- Frontend expects: `payment_url`
- Backend returns: `redirectUrl`

**Fix Required:** Update response mapping in payment controller

---

#### **MISMATCH #4: Schedule/Activities Data Structure**

**Frontend - Dashboard** (wali-murid/dashboard/page.js):
```javascript
const scheduleData = [
  { time: '09.00 - 09.30', senin: 'Senam Pagi', selasa: 'Senam Pagi', rabu: 'Senam Pagi' },
  { time: '09.30 - 10.30', senin: 'Bermain Aktif', selasa: 'Bermain Aktif', rabu: 'Bermain Aktif' },
  // ... hardcoded static data
];
```

**Frontend - Jadwal page** (wali-murid/jadwal/page.js):
```javascript
// Attempts to fetch from API:
GET /api/activities/jadwal?day=${dayNum}
// Expected response structure unclear but fetches multiple times per day
```

**Backend Model** (Activity.js - assumed structure):
```javascript
{
  dayOfWeek: 1-5,
  slots: [
    { start: "09:00", end: "09:30", title: "Senam Pagi", note: "" }
  ]
}
```

**Issue:** 
- Frontend dashboard doesn't fetch schedule (uses hardcoded data)
- Frontend jadwal page tries to fetch but might fail with fallback to hardcoded
- Data structure doesn't match (day as columns vs dayOfWeek in schema)

**Fix Required:** 
- Create proper schedule fetching
- Restructure data for column-based display

---

#### **MISMATCH #5: Weather Data Structure**

**Frontend** (wali-murid/dashboard/page.js):
```javascript
weather = {
  lokasi: string,
  data_cuaca: [
    {
      tanggal: string,
      kota: string,
      suhu_max: string,
      suhu_min: string,
      kondisi: string,
      icon: string (URL),
      persentase_hujan: string
    }
  ]
}
```

**Backend** (weather controller):
- Unknown if it returns this structure
- No documentation on external API being used

**Issue:** Data format compatibility unknown

---

### 3.2 Field Name Mismatches

| Feature | Frontend Field | Backend Field | Issue |
|---------|-----------------|---------------|-------|
| Gallery | `doc.date` | `doc.postedAt` / `doc.createdAt` | ❌ Name differs |
| Gallery | `doc.photo` | `doc.imageUrl` | ❌ Name differs |
| Gallery | `doc.id` | `doc._id` | ⚠️ Type differs |
| Attendance | `status: 'present'` | `status: 'Hadir'` | ❌ Enum differs |
| Payment | `payment_url` | `redirectUrl` | ❌ Name differs |
| Student | `child.nama` | `student.nama` | ✅ OK |
| Student | `child.tanggalLahir` | `student.tanggalLahir` | ✅ OK |
| Notification | `notif.body` | `notif.body` | ✅ OK |
| Weather | `hari.suhu_max` | Unknown | ⚠️ Unknown |

---

## 4. INTEGRATION GAPS

### 4.1 Missing Frontend-Backend Connections

#### **GAP #1: Admin Dashboard Stats**
**Current State:** Hardcoded in frontend
```javascript
const statsData = [
  { id: 1, label: 'Total Murid', value: '43', ... },
  { id: 2, label: 'Total Kelas Aktif', value: '5', ... },
  { id: 3, label: 'Total Guru Aktif', value: '5', ... }
];
```

**Should Fetch From:** `GET /api/student` (count) + backend stats endpoint
**Missing Endpoint:** No `/api/stats` or similar endpoint exists
**Priority:** HIGH

---

#### **GAP #2: Admin Student List for Attendance**
**Current State:** Hardcoded 5 students
```javascript
const studentsList = [
  { id: 1, name: 'Adi Suryanto' },
  { id: 2, name: 'Budi Santoso' },
  // ...
];
```

**Should Fetch From:** `GET /api/student` (admin view)
**Missing Endpoint:** No endpoint to list all students (admin view)
**Priority:** HIGH

---

#### **GAP #3: Teachers List**
**Current State:** Hardcoded in multiple pages
```javascript
const teachersData = [
  { id: 1, name: 'Dr. Bimo...', photo: '/teacher-1.jpg' },
  // ...
];
```

**Should Fetch From:** `GET /api/teacher` or similar
**Missing:** Teachers model and routes completely missing
**Priority:** MEDIUM

---

#### **GAP #4: Admin Activity Feed**
**Current State:** Hardcoded 4 activity items
```javascript
const activitiesData = [
  { id: 1, icon: '📧', title: 'New Lorem...', description: '...' },
  // ...
];
```

**Should Fetch From:** `GET /api/activity-log` or similar
**Missing Endpoint:** No activity log endpoint
**Priority:** LOW

---

#### **GAP #5: Announcements**
**Current State:** Hardcoded text in dashboard
```javascript
announcement: {
  title: "Undangan Pertemuan Ibu Orangtua Murid",
  date: "2 month yang lalu"
}
```

**Should Fetch From:** `GET /api/announcement` or from notification/message system
**Missing Endpoint:** No announcement endpoint
**Priority:** MEDIUM

---

#### **GAP #6: Schedule Real-time Updates**
**Current State:** 
- Admin dashboard uploads schedule and it's cached
- Parent dashboard doesn't auto-update when schedule changes

**Missing:** WebSocket real-time updates for schedule changes
**Priority:** LOW (can use polling)

---

#### **GAP #7: Parent Child Name in Dashboard**
**Current State:** Hardcoded greeting
```javascript
const childName = 'Nama Orangtua Murid'; // Static
```

**Should Fetch:** Get parent's child name from `GET /api/student/my`
**Priority:** HIGH

---

#### **GAP #8: Feedback Management Page**
**Current State:** No admin page to view/manage feedback
**Should Have:** Admin dashboard tab for feedback listing/filtering
**Missing:** Frontend page for admin to view all feedback
**Priority:** MEDIUM

---

#### **GAP #9: Messages/Announcements to Parents**
**Current State:** Message routes exist but not used by frontend
**Should Have:** 
- Admin sends message to parent
- Parent can read message inbox
**Missing:** Frontend UI for messaging
**Priority:** MEDIUM

---

#### **GAP #10: User Search/Filter in Admin**
**Current State:** No search functionality
**Should Have:** 
- Search students by name/NIK
- Filter students by class/status
**Missing:** Frontend search UI + backend search endpoints
**Priority:** LOW

---

### 4.2 Missing Pages Entirely

#### **No Teacher Management Page**
**Should Have:** Admin dashboard tab to:
- Add/edit teachers
- Assign teachers to classes
- View teacher profiles

**Status:** ❌ MISSING

---

#### **No Class Management Page**
**Should Have:** Admin dashboard tab to:
- Create/edit classes
- Assign students to classes
- View class rosters

**Status:** ❌ MISSING

---

#### **No Student Management Dashboard (Admin)**
**Should Have:** Admin view to:
- List all students
- View/edit student details
- Filter by class/status
- Manage registrations (approve/reject)

**Status:** ❌ MISSING (only parent registration page exists)

---

#### **No Financial/Payment Dashboard (Admin)**
**Should Have:** Admin view to:
- View payment statistics
- List all payments by status
- Generate payment reports
- Manual payment entry

**Status:** ❌ MISSING

---

#### **No Weather Management (Admin)**
**Current:** Parents see weather but no admin control
**Should Have:** Admin to configure weather API or manage forecasts
**Status:** ❌ MISSING

---

## 5. API URL INCONSISTENCIES

### 5.1 Endpoint Path Issues

#### **API Base URL**
```javascript
// Frontend:
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Backend:
const PORT = process.env.PORT || 5000;
// Routes registered as: app.use('/api/auth', ...)
```

**Consistency:** ✅ OK - both use `/api/` prefix

---

#### **Field Param Inconsistencies**

| Endpoint | Issue | Current | Should Be |
|----------|-------|---------|-----------|
| `/api/student/my?showNik=1` | Query param unclear | `showNik=1` | Document or remove |
| `/api/activities/jadwal?day=1` | Day numbering unclear | `day=1-5` | Should document (1=Mon, etc) |
| `/api/gallery/search?caption=...` | Should support pagination | No params | Add `skip`, `limit` |
| `/api/feedback?...` | No filtering/pagination | Unknown | Add params |

---

#### **HTTP Status Code Inconsistencies**

**Frontend Expected Patterns:**
- 200 OK for GET
- 201 Created for POST new resources
- 200 OK for PATCH/PUT
- 204 No Content for DELETE (or 200 with message)
- 400 Bad Request for validation
- 401 Unauthorized for auth failures
- 403 Forbidden for permission failures
- 404 Not Found for missing resources
- 500 Server Error

**Backend Implementation:** Appears consistent (201 for create, 400/500 for errors)

---

### 5.2 Authentication Token Handling

**Frontend:**
```javascript
const token = localStorage.getItem('token');
headers: { 'Authorization': `Bearer ${token}` }
```

**Backend:**
```javascript
const auth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  // Validates JWT
}
```

**Consistency:** ✅ OK - Bearer token format standard

---

### 5.3 CORS Configuration

**Frontend:** Deployed on `http://localhost:3000` (dev)
**Backend CORS:**
```javascript
cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
})
```

**Consistency:** ✅ OK - handles both

---

## 6. CRITICAL ISSUES SUMMARY

### Priority 1: CRITICAL (Must Fix Immediately)

| # | Issue | Impact | Fix Effort | Location |
|---|-------|--------|-----------|----------|
| C1 | Gallery field name mismatch (`postedAt` vs `createdAt`, `imageUrl` vs `photo`) | Documentation pages show errors | 1 day | Gallery model + controller |
| C2 | Payment field name (`redirectUrl` vs `payment_url`) | Payment flow breaks | 2 hours | Payment controller response |
| C3 | Attendance status enum (`'present'` vs `'Hadir'`) | Attendance pages show wrong status | 4 hours | Attendance model + frontend mapping |
| C4 | Admin stats hardcoded, should fetch from backend | Stats incorrect/stale | 1 day | Admin dashboard + stats endpoint |
| C5 | Schedule not fetching in parent dashboard | Parents see outdated schedule | 2 days | Schedule API + dashboard |
| C6 | Parent name shows as "Nama Orangtua Murid" hardcoded | Wrong greeting | 2 hours | Dashboard greeting logic |

### Priority 2: HIGH (Should Fix This Sprint)

| # | Issue | Impact | Fix Effort | Location |
|---|-------|--------|-----------|----------|
| H1 | No admin page to list students | Admin can't manage students | 2 days | New admin page + route |
| H2 | Teachers list hardcoded | Can't update teachers | 1 day | Teacher model + routes |
| H3 | No feedback management page (admin) | Admin can't review feedback | 1 day | New admin page |
| H4 | Admin attendance uses hardcoded student list | Can't mark all students | 1 day | Fetch student list from API |
| H5 | Message routes unused/dead code | Dead code in codebase | 4 hours | Remove or implement UI |
| H6 | Weather data format unknown | Potential runtime error | 4 hours | Test or document API |

### Priority 3: MEDIUM (Nice to Have)

| # | Issue | Impact | Fix Effort | Location |
|---|-------|--------|-----------|----------|
| M1 | No logout endpoint | Users can't truly logout (only clear localStorage) | 2 hours | Auth route |
| M2 | No password recovery flow | Users stuck if forgot password | 2 days | New auth flow |
| M3 | No student search in admin | Admin can't find specific students | 1 day | Search route + UI |
| M4 | No class management page | Can't organize students by class | 2 days | New admin pages |
| M5 | Activity feed hardcoded | Can't track real activities | 2 days | Activity log model + routes |
| M6 | No real-time notifications (using polling) | Slight delay in updates | 1 day | Implement WebSocket better |
| M7 | No announcements/news system | No way to post news to parents | 2 days | New model + routes |

### Priority 4: LOW (Enhancement)

| # | Issue | Impact | Fix Effort |
|---|-------|--------|-----------|
| L1 | No pagination on lists (gallery, feedback, etc.) | Pages slow with large datasets | 2 days |
| L2 | No filtering/search for most lists | Hard to find specific items | 2 days |
| L3 | No activity logging system | Can't audit user actions | 3 days |
| L4 | No email notifications | Parents only see in-app notifications | 1 day |
| L5 | No SMS notifications | Alternative notification method missing | 1 day |

---

## QUICK FIX CHECKLIST

### Can Be Fixed in Backend Only (Frontend needs no changes):

- [ ] Change Gallery model `postedAt` → `createdAt` (or update controller response)
- [ ] Change Payment response `redirectUrl` → `payment_url`
- [ ] Standardize Attendance status enum to `'present'/'absent'` internally
- [ ] Add logout endpoint
- [ ] Create `/api/stats` endpoint for dashboard stats
- [ ] Create `/api/teacher` endpoints
- [ ] Create `/api/student` list endpoint (admin)
- [ ] Fix teacher data structure

### Requires Frontend Changes:

- [ ] Update gallery mapping to use correct field names
- [ ] Fix parent dashboard to fetch child name
- [ ] Fix admin dashboard to fetch student list for attendance
- [ ] Fix schedule dashboard to fetch from API instead of static data
- [ ] Add attendance page for admin
- [ ] Add student management page (admin)
- [ ] Add feedback management page (admin)
- [ ] Add teacher management page (admin)
- [ ] Add class management page (admin)

---

## RECOMMENDATIONS

1. **Immediate:** Fix all Priority 1 issues this week
2. **This Sprint:** Address Priority 2 issues
3. **Next Sprint:** Implement Priority 3 enhancements
4. **Backlog:** Consider Priority 4 improvements

2. **Code Standards:**
   - Use consistent field naming (camelCase for JS, snake_case for API responses if needed)
   - Document all API endpoint formats
   - Keep field names same between model and API response
   - Use TypeScript or JSDoc for better type safety

3. **Testing:**
   - Create integration tests for each API endpoint
   - Test field name mappings between FE and BE
   - Verify all enum values match between layers

4. **Documentation:**
   - Create API documentation (Swagger/OpenAPI)
   - Document data structures for each endpoint
   - Create field mapping documentation

---

**Report Generated:** 2025-11-17  
**Analysis Completed:** Full codebase review (26 pages analyzed)

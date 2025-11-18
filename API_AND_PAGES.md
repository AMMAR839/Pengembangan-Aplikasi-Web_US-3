# 📚 Complete API List & Frontend Page Structure

---

## 🔌 Backend APIs (Express.js)

### **BASE URL**: `http://localhost:5000/api`

---

### 🔐 **AUTH Routes** (`/api/auth`)

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| POST | `/register` | ❌ | - | User registration |
| POST | `/login` | ❌ | - | User login (returns JWT token) |
| GET | `/me` | ✅ | Any | Get current user profile |
| POST | `/change-password` | ✅ | Any | Change user password |
| GET | `/verify-email` | ❌ | - | Verify email (via link) |
| GET | `/google/login` | ❌ | - | Google OAuth login |
| GET | `/google/register` | ❌ | - | Google OAuth register |
| GET | `/google/callback` | ❌ | - | Google OAuth callback |

---

### 👨‍👩‍👧 **STUDENT Routes** (`/api/student`)

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| POST | `/register` | ✅ | user, parent, admin | Register new student |
| GET | `/` | ✅ | admin | List all students (with filters) |
| GET | `/my` | ✅ | parent, admin | List parent's own students |
| PATCH | `/:id` | ✅ | parent, admin | Update student data |
| PATCH | `/:id/status` | ✅ | admin | Update student status/class |

**Query Parameters for GET `/`:**
- `status` - Filter by status (pending, active, rejected)
- `kelas` - Filter by class (A, B)
- `search` - Search by student name

---

### 💰 **PAYMENT Routes** (`/api/payment`)

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| POST | `/checkout-by-nik` | ✅ | parent, admin | Create payment (Midtrans) |
| POST | `/callback` | ❌ | - | Midtrans webhook callback |
| GET | `/my-payments` | ✅ | Any | List user's own payments |

---

### 📅 **ACTIVITIES Routes** (`/api/activities`)

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| POST | `/jadwal` | ✅ | admin, teacher | Create daily schedule |
| GET | `/jadwal` | ❌ | - | Get schedule by day (query: ?day=1-5) |
| GET | `/daily` | ❌ | - | Get daily activity log |
| GET | `/current` | ✅ | parent, admin, teacher | Get current activity (now) |
| POST | `/daily/:logId/slots/:slotId/photos` | ✅ | admin, teacher | Upload activity photos |
| DELETE | `/daily/:logId/slots/:slotId/photos/:photoId` | ✅ | admin, teacher | Delete activity photo |
| PATCH | `/daily/:logId/slots/:slotId/photos/:photoId` | ✅ | admin, teacher | Update photo caption |

**Query Parameters:**
- `day` - Day of week (1=Senin, 2=Selasa, ..., 5=Jumat)

---

### ✅ **ATTENDANCE Routes** (`/api/attendance`)

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| GET | `/` | ✅ | admin, teacher | List all attendance records |
| GET | `/my` | ✅ | parent, admin | Get own attendance summary |
| GET | `/my-details` | ✅ | parent, admin | Get detailed attendance (per day) |
| POST | `/` | ✅ | admin, teacher | Mark attendance |

---

### 📢 **NOTIFICATION Routes** (`/api/notification`)

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| POST | `/` | ✅ | admin | Create new notification |
| GET | `/my` | ✅ | Any | Get my notifications |
| GET | `/` | ✅ | admin | List all notifications |
| PATCH | `/:id/read` | ✅ | Any | Mark notification as read |
| GET | `/stream` | ✅ | Any | Real-time SSE stream |

**POST Body Example:**
```json
{
  "title": "Pengumuman Penting",
  "body": "Sekolah libur besok",
  "audience": "all" // or "parents", "byUser"
}
```

---

### 💬 **FEEDBACK Routes** (`/api/feedback`)

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| POST | `/` | ✅ | Any | Submit feedback |
| GET | `/` | ✅ | admin, teacher | List all feedback |
| GET | `/my` | ✅ | Any | List own feedback |

**POST Body Example:**
```json
{
  "feedback": "Anaknya sangat senang dengan program ini"
}
```

---

### 🗨️ **MESSAGE Routes** (`/api/message`)

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| POST | `/send` | ✅ | Any | Send message |
| GET | `/inbox` | ✅ | Any | Get inbox messages |

---

### 🖼️ **GALLERY Routes** (`/api/gallery`)

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| GET | `/` | ✅ | Any | Get all photos |
| POST | `/upload` | ✅ | admin, teacher | Upload photo |
| GET | `/search` | ✅ | admin | Search photos by caption |
| PATCH | `/:id/toggle` | ✅ | admin | Toggle photo visibility |

**POST Form Data:**
- `photo` (file) - Image file
- `caption` (string) - Photo caption

---

### 🌤️ **WEATHER Routes** (`/api/weather`)

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| GET | `/` | ❌ | - | Get weather forecast |

---

## 🌐 Frontend Pages Structure

### **Directory Structure:**
```
frontend/app/
├── page.js                          # Login page (/)
├── register/
│   └── page.js                      # Register page (/register)
├── pendaftaran-anak/
│   └── page.js                      # Student registration (/pendaftaran-anak)
├── ganti-password/
│   └── page.js                      # Change password (/ganti-password)
├── profil/
│   └── page.js                      # User profile (/profil)
├── verify-email/
│   └── page.js                      # Email verification (/verify-email)
├── riwayat-pembayaran/
│   └── page.js                      # Payment history (/riwayat-pembayaran)
├── auth/
│   └── google/
│       └── callback/
│           └── page.js              # Google OAuth callback
├── umum/
│   └── page.js                      # General dashboard (/umum)
├── admin/
│   └── page.js                      # Admin dashboard (/admin)
│       ├── Tab: Dashboard
│       ├── Tab: Notifikasi
│       ├── Tab: Edit Jadwal
│       ├── Tab: Dokumentasi
│       ├── Tab: Manajemen Siswa
│       ├── Tab: Feedback
│       └── Tab: Absensi
└── wali-murid/                      # Parent (Guardian) area
    ├── dashboard/
    │   └── page.js                  # Parent dashboard (/wali-murid/dashboard)
    │       ├── Jadwal Harian
    │       ├── Presentase Kehadiran
    │       ├── Guru Kami
    │       ├── Dokumentasi KBM
    │       └── Feedback Form
    ├── jadwal/
    │   └── page.js                  # Schedule view (/wali-murid/jadwal)
    ├── dokumentasi-kbm/
    │   └── page.js                  # Activity documentation (/wali-murid/dokumentasi-kbm)
    ├── profil-anak/
    │   └── page.js                  # Child profile (/wali-murid/profil-anak)
    └── feedback/
        └── page.js                  # Feedback history (/wali-murid/feedback)
```

---

## 📄 Frontend Pages Detail

### **Public Pages** (No Auth Required)

| Route | Page | Purpose |
|-------|------|---------|
| `/` | Login | User login page |
| `/register` | Register | User registration page |
| `/auth/google/callback` | Google OAuth | Google OAuth callback handler |

---

### **Protected Pages - General Users**

| Route | Page | Purpose | Auth | Components |
|-------|------|---------|------|------------|
| `/pendaftaran-anak` | Student Registration | Register child for school | ✅ | Form, Photo upload, Parent data |
| `/profil` | User Profile | View/edit user profile | ✅ | User info, Change password |
| `/ganti-password` | Change Password | Update password | ✅ | Password form |
| `/verify-email` | Email Verification | Verify email via token | ✅ | Verification handler |
| `/riwayat-pembayaran` | Payment History | View payment records | ✅ | Payment table, Status badge |
| `/umum` | General Dashboard | General user dashboard | ✅ | Stats, Activities, Profile |

---

### **Protected Pages - Admin Only** (`/admin`)

| Tab | Features | API Calls |
|-----|----------|-----------|
| **Dashboard** | View stats, recent activities | GET /api/student, GET /api/notification |
| **Notifikasi** | Create & send real-time notifications | POST /api/notification, GET /api/notification |
| **Edit Jadwal** | Create/modify daily schedules | POST /api/activities/jadwal, GET /api/activities |
| **Dokumentasi** | Upload activity photos | POST /api/gallery/upload, GET /api/gallery |
| **Manajemen Siswa** | List, filter, accept/reject, assign class | GET /api/student, PATCH /api/student/:id/status |
| **Feedback** | Review all parent feedback | GET /api/feedback |
| **Absensi** | Mark daily attendance | POST /api/attendance, GET /api/attendance |

---

### **Protected Pages - Parents/Guardians** (`/wali-murid`)

| Route | Page | Features | API Calls |
|-------|------|----------|-----------|
| `/dashboard` | Dashboard | View schedule, attendance %, teachers, feedback form | GET /api/activities/jadwal, GET /api/attendance/my, GET /api/weather, GET /api/gallery |
| `/jadwal` | Schedule | View daily schedule for week | GET /api/activities/jadwal?day={1-5} |
| `/dokumentasi-kbm` | Activity Photos | View activity documentation | GET /api/gallery |
| `/profil-anak` | Child Profile | View child info, attendance details | GET /api/student/my, GET /api/attendance/my-details |
| `/feedback` | Feedback History | View submitted feedback | GET /api/feedback/my |

---

## 🔑 Authentication

### **JWT Token Structure**
```javascript
// Header
Authorization: Bearer <token>

// Token contains
{ 
  id: userId,
  iat: issuedAt,
  exp: expiresIn // 1 day
}
```

### **User Roles**
1. **admin** - Full system access
2. **teacher** - Can manage activities, attendance, notifications
3. **parent** - Can view student info, submit feedback
4. **user** - Basic user permissions

---

## 🔒 Authentication Flow

### **Login Flow**
```
1. POST /api/auth/login
2. Receive: { token, username, role }
3. Store in localStorage
4. All subsequent requests include: Authorization: Bearer <token>
5. Middleware validates token
```

### **Google OAuth Flow**
```
1. GET /api/auth/google/login (or /google/register)
2. Redirect to Google
3. User authenticates
4. Google redirects to /api/auth/google/callback
5. Server generates JWT
6. Redirect to frontend with token in URL
```

---

## 📊 Data Models

### **User**
```javascript
{
  _id: ObjectId,
  email: String (unique),
  username: String (unique),
  password: String (hashed),
  role: 'admin' | 'teacher' | 'parent' | 'user',
  isVerified: Boolean,
  googleId: String (optional),
  createdAt: Date,
  updatedAt: Date
}
```

### **Student**
```javascript
{
  _id: ObjectId,
  nama: String,
  tanggalLahir: Date,
  photoUrl: String,
  status: 'pending' | 'active' | 'rejected',
  kelas: 'A' | 'B' | null,
  parentUserId: ObjectId (ref: User),
  paymentStatus: String,
  createdAt: Date
}
```

### **Notification**
```javascript
{
  _id: ObjectId,
  title: String,
  body: String,
  audience: 'all' | 'parents' | 'byUser',
  createdBy: ObjectId (ref: User),
  readBy: [ObjectId],
  createdAt: Date
}
```

### **Feedback**
```javascript
{
  _id: ObjectId,
  feedback: String,
  parentUserId: ObjectId (ref: User),
  createdAt: Date
}
```

---

## 🚀 Common Request Examples

### **Login**
```bash
POST /api/auth/login
Content-Type: application/json

{
  "username": "parent@email.com",
  "password": "password123"
}
```

### **Get Schedule**
```bash
GET /api/activities/jadwal?day=1
Authorization: Bearer <token>
```

### **Create Notification**
```bash
POST /api/notification
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Pengumuman",
  "body": "Sekolah libur besok",
  "audience": "all"
}
```

### **Upload Documentation**
```bash
POST /api/gallery/upload
Authorization: Bearer <token>
Content-Type: multipart/form-data

photo: <file>
caption: "Pembelajaran hari ini"
```

### **Submit Feedback**
```bash
POST /api/feedback
Authorization: Bearer <token>
Content-Type: application/json

{
  "feedback": "Anak saya sangat senang"
}
```

---

## 🎯 Key Features

✅ Real-time Notifications (Socket.IO)
✅ Role-based Access Control
✅ Google OAuth Integration
✅ Student Management
✅ Schedule Management
✅ Attendance Tracking
✅ Payment Integration (Midtrans)
✅ Photo Documentation
✅ Feedback System
✅ Weather Integration
✅ Email Verification

---

## 📱 Environment Variables

### Backend (`.env`)
```
PORT=5000
MONGO_URI=mongodb+srv://...
JWT_SECRET=mysupersecretkey
MIDTRANS_SERVER_KEY=Mid-server-...
MIDTRANS_CLIENT_KEY=Mid-client-...
WEATHER_API_KEY=...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
FRONTEND_URL=http://localhost:3000
MAIL_USER=email@gmail.com
MAIL_PASS=password
SUPABASE_URL=...
SUPABASE_ANON_KEY=...
SUPABASE_BUCKET=Foto_Student
```

### Frontend (`.env.local`)
```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

---

## 🎬 How to Run

### **Backend**
```bash
cd backend
npm install
npm start
# Server runs on http://localhost:5000
```

### **Frontend**
```bash
cd frontend
npm install
npm run dev
# App runs on http://localhost:3000
```

---

**Last Updated**: November 18, 2025

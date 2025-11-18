# FE/BE Integration Fixes - Comprehensive Plan

## Status: IN PROGRESS - Session 2 Updates Applied

### Priority 1: CRITICAL FIXES (Do First)

#### 1. Admin Dashboard Stats - Replace Hardcoded Values
**File:** `frontend/app/admin/page.js`
**Issue:** statsData is hardcoded (43 students, 5 classes, 5 teachers)
**Fix:** Fetch from API endpoints:
- `GET /api/student` → count total students
- `GET /api/activities` → count unique days (as "classes")
- Need teacher endpoint or hardcode if no teacher model

**Code Location:** Lines 8-30
**Status:** ⏳ PENDING

#### 2. Fix Attendance Status Mismatch
**Backend:** `"Hadir" | "Tidak Hadir" | "Izin"`
**Files to Update:**
- `backend/src/models/Attendance.js` - ✓ Already correct
- `frontend/app/wali-murid/attendance/page.js` - Check mock data uses same enum
- `backend/src/routes/attendance.js` - Verify endpoints return correct status

**Status:** ⏳ PENDING - verify frontend uses same enums

#### 3. Payment Field Validation
**Backend Model Fields:**
- `userId` (ref to User)
- `studentNik` (Student ID)
- `orderId` (unique)
- `amount`
- `status` (enum: pending|settlement|failed|expire|cancel|deny)
- `redirectUrl`

**Frontend File:** `frontend/app/riwayat-pembayaran/page.js`
**Status:** ✓ LOOKS OK - fetchPayments calls `/api/payment/my-payments`

#### 4. Gallery Field Mapping Verification
**Backend Fields:**
- `caption` → Frontend should map to: `notes`
- `imageUrl` → Frontend should map to: `photo`
- `postedAt` → Frontend should map to: `date`
- `isVisible` → use if needed

**Frontend File:** `frontend/app/wali-murid/dokumentasi-kbm/page.js`
**Status:** ✓ ALREADY FIXED - mapping confirmed correct

---

### Priority 2: MISSING FEATURES (High Impact)

#### 5. Admin Student Management Page
**Status:** ✅ IMPLEMENTED - Added "Manajemen Siswa" tab to admin dashboard
**Features:**
- ✅ List all students with filters (all, pending, active, rejected)
- ✅ View student details (nama, status, kelas, payment status)
- ✅ Update student status (pending → active/rejected)
- ✅ Assign student to kelas (A or B)
- ✅ View student payment status

**Endpoints Used:**
- `GET /api/student` - List all students (added to backend)
- `PATCH /api/student/{id}/status` - Update student status/kelas (added to backend)

**Frontend Files Modified:**
- `frontend/app/admin/page.js` - Added students tab with full functionality

#### 6. Admin Feedback Review Page
**Status:** ✅ IMPLEMENTED - Added "Feedback" tab to admin dashboard
**Features:**
- ✅ List all feedback from parents
- ✅ Display feedback with timestamps and parent username
- ✅ Shows feedback ID for reference
- Basic implementation (can add delete/update later)

**Endpoints Used:**
- `GET /api/feedback` - Get all feedback (already existed)

**Frontend Files Modified:**
- `frontend/app/admin/page.js` - Added feedback tab with full functionality

#### 7. Parent Profile - Show Parent Name
**File:** `frontend/app/profil/page.js`
**Issue:** Parent name shows as generic placeholder
**Fix:** After login, fetch User details to get parent name

**Endpoint:** Could add `GET /api/auth/me` to get current user info
**Status:** ⏳ PENDING

#### 8. Attendance Page - Use Real Student List
**File:** `frontend/app/wali-murid/attendance/page.js`
**Issue:** `studentsList` is hardcoded with 5 students
**Fix:** Fetch from `GET /api/student/my-children` (students of logged-in parent)
**Status:** ⏳ PENDING

---

### Priority 3: VERIFICATION TASKS

#### 9. Message System (Check if used)
**Route:** `backend/src/routes/messages.js`
**Models:** `backend/src/models/Message.js`
**Frontend Usage:** Not found in UI
**Status:** ❓ UNCLEAR - verify if feature is needed or dead code

#### 10. Weather API Integration
**Route:** `backend/src/routes/weather.js`
**Frontend Usage:** Not found being used
**Status:** ❓ UNCLEAR - verify endpoint format and if needed

#### 11. Attendance Stats on Dashboard
**File:** `frontend/app/wali-murid/dashboard/page.js`
**Issue:** Needs to fetch attendance percentage
**Status:** ⏳ PENDING - Check if already implemented

---

## API Integration Checklist

### Endpoints That Should Exist:
- ✓ `POST /api/auth/register` - Student registration
- ✓ `POST /api/auth/login` - Login
- ✓ `GET /api/student` - List all students (admin)
- ✓ `GET /api/student/my-children` - Get parent's children (parent)
- ✓ `POST /api/student/register` - Register new student
- ✓ `GET /api/payment/my-payments` - Get parent's payments
- ✓ `POST /api/payment/checkout-by-nik` - Start payment
- ✓ `GET /api/activities` - Get all schedules
- ✓ `POST /api/activities/jadwal` - Save schedule (admin)
- ✓ `GET /api/activities/jadwal` - Get schedule by day
- ✓ `GET /api/attendance/my` - Get attendance summary
- ✓ `GET /api/attendance/my-details` - Get detailed attendance
- ✓ `GET /api/gallery` - Get documentation photos
- ✓ `POST /api/gallery/upload` - Upload photos (admin)
- ✓ `POST /api/feedback` - Submit feedback
- ✓ `GET /api/feedback` - Get all feedback (admin)
- ✓ `POST /api/notification` - Create notification (admin)
- ✓ `GET /api/notification/my` - Get my notifications
- ✓ `GET /api/message` - Get messages (likely unused)

### Endpoints That May Be Missing:
- ❓ `GET /api/auth/me` - Get current user details
- ❓ `PATCH /api/student/{id}` - Update student
- ❓ `PATCH /api/feedback/{id}` - Update feedback status
- ❓ `DELETE /api/feedback/{id}` - Delete feedback
- ❓ `GET /api/student/my-children` - Get parent's children

---

## Files Modified So Far:
1. ✓ `frontend/app/admin/page.js` - Updated sidebar, state variables, handlers
2. ✓ `frontend/app/wali-murid/jadwal/page.js` - Removed className parameter
3. ✓ All other FE pages - API URLs standardized

## Next Steps:
1. Create API endpoints for missing features
2. Implement admin stats fetching
3. Create student management page
4. Create feedback review page
5. Fix parent name display
6. Use real student list in attendance
7. Verify message and weather systems


# Frontend - Backend Data Alignment Audit

## Summary
This document tracks all FE-BE API integrations and identifies data structure mismatches that need fixing.

---

## 1. **Gallery / Documentation** ❌ MISMATCH
**Backend Model:**
```javascript
{
  _id: ObjectId,
  caption: String,
  imageUrl: String,
  postedAt: Date,
  isVisible: Boolean
}
```

**Frontend Expects (wali-murid/dashboard):**
```javascript
{
  id: String,
  date: String (formatted),
  photo: String (imageUrl)
}
```

**Frontend Expects (admin page):**
```javascript
{
  _id: ObjectId,
  imageUrl: String,
  createdAt: Date
}
```

**Issues:**
- FE uses `doc.date` but BE returns `postedAt`
- FE uses `doc.photo` but BE returns `imageUrl` 
- Gallery upload sends `date` field which BE Gallery model doesn't have
- Should map to `caption` or add date field to Gallery schema

---

## 2. **Attendance** ❌ MISMATCH
**Backend Model:**
```javascript
{
  name: String,
  date: Date,
  status: String ("Hadir" | "Tidak Hadir" | "Izin")
}
```

**Frontend Expects (admin/page.js):**
```javascript
POST: { date, studentIds: [id1, id2, ...] }
GET: { records: [{date, status, dateFormatted}], totalDays, presentDays, absentDays }
```

**Issues:**
- BE model stores individual records, FE sends array of studentIds
- BE expects `name`, FE sends studentId array
- FE expects calculated stats (totalDays, presentDays, absentDays) which BE doesn't compute
- Status values: BE uses "Hadir"/"Tidak Hadir", FE uses "present"/"absent"
- FE expects dateFormatted, BE doesn't provide

---

## 3. **Notification** ✅ MOSTLY MATCH
**Backend Model:**
```javascript
{
  _id: ObjectId,
  title: String,
  body: String,
  audience: String ("all" | "parents" | "byUser"),
  recipients: [userId],
  createdBy: userId,
  readBy: [userId],
  timestamps: {createdAt, updatedAt}
}
```

**Frontend Expects (admin/page.js):**
```javascript
POST: { title, body, audience, ... }
GET: Array of notifications with title, body
```

**Issues:**
- FE sends `notifBody` but BE expects `body` ✓
- FE can read title/body ✓
- No major issues here

---

## 4. **Payment** ⚠️ PARTIAL MATCH
**Backend Model:**
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  studentNik: String,
  orderId: String,
  amount: Number,
  status: String ("pending"|"settlement"|"failed"|"expire"|"cancel"|"deny"),
  redirectUrl: String,
  timestamps: {createdAt, updatedAt}
}
```

**Frontend Expects (riwayat-pembayaran/page.js):**
```javascript
GET /api/payment/my-payments: Array of payments
POST /api/payment/checkout-by-nik: { nik }
Response: { payment_url, message }
```

**Issues:**
- FE sends NIK, BE queries by studentNik ✓
- FE expects `payment_url`, BE returns `redirectUrl` ❌
- Status mapping might differ (FE may expect different enum values)

---

## 5. **Activity/Schedule** ⚠️ MISMATCH
**Backend Model:**
```javascript
{
  className: String ("A" | "B"),
  dayOfWeek: Number (1-5),
  slots: [{start, end, title, note}],
  createdBy: userId,
  timestamps
}
```

**Frontend Uses (wali-murid/dashboard, jadwal/page.js):**
```javascript
Static scheduleData = [
  { time: '09.00 - 09.30', senin: 'Senam Pagi', selasa: '...', rabu: '...' }
]
```

**Issues:**
- FE uses hardcoded static data, doesn't fetch from BE ❌
- FE layout (day columns) doesn't match BE schema (dayOfWeek)
- Should implement GET /api/activities to fetch schedule

---

## 6. **Weather** ❌ MISMATCH
**Frontend Expects (wali-murid/dashboard):**
```javascript
{
  lokasi: String,
  data_cuaca: [{
    tanggal: String,
    kota: String,
    suhu_max: String,
    suhu_min: String,
    kondisi: String,
    icon: String (URL),
    persentase_hujan: String
  }]
}
```

**Backend:**
- No weather endpoint exists in code ❌
- Using fallback/dummy data in FE

---

## 7. **Student Profile** ✅ MOSTLY MATCH
**Backend Endpoint:** `GET /api/student/my?showNik=1`

**Frontend Expects (wali-murid/profil-anak/page.js):**
```javascript
Array of students with full profile data
```

**Issues:**
- FE queries with `showNik=1`, unclear if this works ✓
- Should verify response format includes all needed fields

---

## 8. **Authentication** ✅ MATCH
**FE sends:** `POST /api/auth/login` with email, password
**BE expects:** Username/email and password ✓

---

## Summary of Changes Needed

| Feature | Issue | Priority | Fix |
|---------|-------|----------|-----|
| Gallery | `postedAt`→`createdAt`, `date` field missing | HIGH | Update schema or mapping |
| Attendance | Status enum mismatch, schema doesn't match FE flow | HIGH | Redesign Attendance model |
| Payment | `redirectUrl` → `payment_url` | MEDIUM | Response mapping |
| Activities | No BE endpoint, hardcoded in FE | HIGH | Create GET /api/activities |
| Weather | No endpoint, all fallback data | MEDIUM | Implement or remove |


'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [token, setToken] = useState('');

  // Get token from localStorage
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    
    if (!savedToken || role !== 'admin') {
      router.push('/');
      return;
    }
    setToken(savedToken);
  }, [router]);

  // Fetch dashboard data
  useEffect(() => {
    if (!token) return;
    fetchAllData();
  }, [token]);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const headers = { 'Authorization': `Bearer ${token}` };

      // Fetch stats
      const statsRes = await fetch(`${API_URL}/admin/stats`, { headers });
      if (statsRes.ok) {
        setStats(await statsRes.json());
      }

      // Fetch students
      const studentsRes = await fetch(`${API_URL}/admin/students`, { headers });
      if (studentsRes.ok) {
        const data = await studentsRes.json();
        setStudents(data.data || []);
      }

      // Fetch teachers
      const teachersRes = await fetch(`${API_URL}/admin/teachers`, { headers });
      if (teachersRes.ok) {
        const data = await teachersRes.json();
        setTeachers(data.data || []);
      }

      // Fetch payments
      const paymentsRes = await fetch(`${API_URL}/admin/payments`, { headers });
      if (paymentsRes.ok) {
        const data = await paymentsRes.json();
        setPayments(data.data || []);
      }

      setError('');
    } catch (err) {
      console.error(err);
      setError('Gagal memuat data');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentAction = async (paymentId, status) => {
    try {
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      };

      const res = await fetch(`${API_URL}/admin/payments/${paymentId}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ status }),
      });

      if (res.ok) {
        fetchAllData(); // Refresh data
      } else {
        alert('Gagal update pembayaran');
      }
    } catch (err) {
      console.error(err);
      alert('Error: ' + err.message);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    router.push('/');
  };

  if (!token) return <div>Redirecting...</div>;
  if (loading) return <div className="p-8 text-center">Memuat data...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600">Kelola aplikasi PAUD</p>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Logout
          </button>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar Navigation */}
        <aside className="w-64 bg-white shadow-md p-6">
          <nav className="space-y-2">
            {[
              { id: 'overview', label: 'Overview', icon: '📊' },
              { id: 'students', label: 'Siswa', icon: '👥' },
              { id: 'teachers', label: 'Guru', icon: '👨‍🏫' },
              { id: 'payments', label: 'Pembayaran', icon: '💳' },
              { id: 'settings', label: 'Pengaturan', icon: '⚙️' },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full text-left px-4 py-2 rounded transition ${
                  activeTab === item.id
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {item.icon} {item.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {/* Overview Tab */}
          {activeTab === 'overview' && stats && (
            <div>
              <h2 className="text-xl font-bold mb-6">Dashboard Overview</h2>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <StatCard
                  title="Total Siswa"
                  value={stats.students.total}
                  icon="👥"
                  color="bg-blue-100"
                  details={[
                    { label: 'Aktif', value: stats.students.active },
                    { label: 'Pending', value: stats.students.pending },
                  ]}
                />
                <StatCard
                  title="Total Guru"
                  value={stats.teachers.total}
                  icon="👨‍🏫"
                  color="bg-green-100"
                  details={[{ label: 'Aktif', value: stats.teachers.active }]}
                />
                <StatCard
                  title="Total Kelas"
                  value={stats.classes.total}
                  icon="📚"
                  color="bg-purple-100"
                  details={[{ label: 'Kelas', value: stats.classes.list.join(', ') || '-' }]}
                />
                <StatCard
                  title="Pembayaran"
                  value={`Rp ${(stats.payments.totalRevenue || 0).toLocaleString('id-ID')}`}
                  icon="💰"
                  color="bg-yellow-100"
                  details={[
                    { label: 'Selesai', value: stats.payments.completed },
                    { label: 'Pending', value: stats.payments.pending },
                  ]}
                />
              </div>

              {/* Quick Summary */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-lg font-semibold mb-4">Ringkasan User</h3>
                  <ul className="space-y-2">
                    <li className="flex justify-between">
                      <span>Total User Terdaftar</span>
                      <strong>{stats.users.total}</strong>
                    </li>
                    <li className="flex justify-between">
                      <span>User Terverifikasi</span>
                      <strong>{stats.users.verified}</strong>
                    </li>
                    <li className="flex justify-between">
                      <span>Attendance Today</span>
                      <strong>{stats.attendance.present}</strong>
                    </li>
                  </ul>
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-lg font-semibold mb-4">Statistik Pembayaran</h3>
                  <ul className="space-y-2">
                    <li className="flex justify-between">
                      <span>Total Transaksi</span>
                      <strong>{stats.payments.total}</strong>
                    </li>
                    <li className="flex justify-between">
                      <span>Transaksi Berhasil</span>
                      <strong className="text-green-600">{stats.payments.completed}</strong>
                    </li>
                    <li className="flex justify-between">
                      <span>Menunggu Verifikasi</span>
                      <strong className="text-yellow-600">{stats.payments.pending}</strong>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Students Tab */}
          {activeTab === 'students' && (
            <div>
              <h2 className="text-xl font-bold mb-6">Manajemen Siswa</h2>
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold">NIK</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold">Nama</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold">Kelas</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold">Status</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold">Pembayaran</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.length > 0 ? (
                      students.map((student) => (
                        <tr key={student._id} className="border-t">
                          <td className="px-6 py-3 text-sm">{student.nik}</td>
                          <td className="px-6 py-3 text-sm">{student.nama}</td>
                          <td className="px-6 py-3 text-sm">{student.kelas || '-'}</td>
                          <td className="px-6 py-3 text-sm">
                            <span
                              className={`px-2 py-1 rounded text-xs font-semibold ${
                                student.status === 'active'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}
                            >
                              {student.status}
                            </span>
                          </td>
                          <td className="px-6 py-3 text-sm">{student.paymentStatus || 'pending'}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="px-6 py-3 text-center text-gray-500">
                          Tidak ada data siswa
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Teachers Tab */}
          {activeTab === 'teachers' && (
            <div>
              <h2 className="text-xl font-bold mb-6">Manajemen Guru</h2>
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold">Nama</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold">NIP</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold">Kelas</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold">Email</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {teachers.length > 0 ? (
                      teachers.map((teacher) => (
                        <tr key={teacher._id} className="border-t">
                          <td className="px-6 py-3 text-sm">{teacher.nama}</td>
                          <td className="px-6 py-3 text-sm">{teacher.nip}</td>
                          <td className="px-6 py-3 text-sm">{teacher.kelas || '-'}</td>
                          <td className="px-6 py-3 text-sm">{teacher.email}</td>
                          <td className="px-6 py-3 text-sm">
                            <span
                              className={`px-2 py-1 rounded text-xs font-semibold ${
                                teacher.status === 'active'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {teacher.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="px-6 py-3 text-center text-gray-500">
                          Tidak ada data guru
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Payments Tab */}
          {activeTab === 'payments' && (
            <div>
              <h2 className="text-xl font-bold mb-6">Verifikasi Pembayaran</h2>
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold">Siswa</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold">Jumlah</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold">Tanggal</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.length > 0 ? (
                      payments.map((payment) => (
                        <tr key={payment._id} className="border-t">
                          <td className="px-6 py-3 text-sm">
                            {payment.studentId?.nama || 'N/A'}
                          </td>
                          <td className="px-6 py-3 text-sm">
                            Rp {payment.amount?.toLocaleString('id-ID') || 0}
                          </td>
                          <td className="px-6 py-3 text-sm">
                            {new Date(payment.createdAt).toLocaleDateString('id-ID')}
                          </td>
                          <td className="px-6 py-3 text-sm space-x-2">
                            <button
                              onClick={() =>
                                handlePaymentAction(payment._id, 'completed')
                              }
                              className="px-3 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() =>
                                handlePaymentAction(payment._id, 'rejected')
                              }
                              className="px-3 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600"
                            >
                              Reject
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="px-6 py-3 text-center text-gray-500">
                          Tidak ada pembayaran yang menunggu
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div>
              <h2 className="text-xl font-bold mb-6">Pengaturan</h2>
              <div className="bg-white p-6 rounded-lg shadow max-w-md">
                <p className="text-gray-600">Fitur pengaturan segera hadir</p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

// Stat Card Component
function StatCard({ title, value, icon, color, details }) {
  return (
    <div className={`${color} p-6 rounded-lg shadow`}>
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-gray-700 text-sm font-semibold">{title}</p>
          <p className="text-2xl font-bold mt-2">{value}</p>
        </div>
        <span className="text-3xl">{icon}</span>
      </div>
      {details && (
        <div className="text-xs text-gray-600 space-y-1">
          {details.map((detail, idx) => (
            <div key={idx} className="flex justify-between">
              <span>{detail.label}:</span>
              <strong>{detail.value}</strong>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

'use client'

import { useState } from 'react'

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [uploadedPhotos, setUploadedPhotos] = useState([])
  const [photoPreview, setPhotoPreview] = useState(null)
  const [notifType, setNotifType] = useState('umum')
  const [selectedClass, setSelectedClass] = useState('')

  // Handle photo upload
  const handlePhotoUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPhotoPreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const submitPhoto = async () => {
    if (!photoPreview) return
    // TODO: API call to upload photo
    setUploadedPhotos([...uploadedPhotos, { id: Date.now(), url: photoPreview, date: new Date() }])
    setPhotoPreview(null)
    alert('Foto berhasil diupload!')
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-20 bg-[#5EAC9E] flex flex-col items-center py-6 space-y-8">
        <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center">
          <span className="text-[#5EAC9E] font-bold text-xs">🌱</span>
        </div>
        
        <nav className="flex-1 flex flex-col space-y-6">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`w-12 h-12 rounded-lg flex items-center justify-center text-white transition ${activeTab === 'dashboard' ? 'bg-teal-700' : 'hover:bg-teal-600'}`}
            title="Dashboard"
          >
            🏠
          </button>
          <button 
            onClick={() => setActiveTab('upload')}
            className={`w-12 h-12 rounded-lg flex items-center justify-center text-white transition ${activeTab === 'upload' ? 'bg-teal-700' : 'hover:bg-teal-600'}`}
            title="Upload Foto"
          >
            📸
          </button>
          <button 
            onClick={() => setActiveTab('notif')}
            className={`w-12 h-12 rounded-lg flex items-center justify-center text-white transition ${activeTab === 'notif' ? 'bg-teal-700' : 'hover:bg-teal-600'}`}
            title="Notifikasi"
          >
            🔔
          </button>
          <button 
            onClick={() => setActiveTab('feedback')}
            className={`w-12 h-12 rounded-lg flex items-center justify-center text-white transition ${activeTab === 'feedback' ? 'bg-teal-700' : 'hover:bg-teal-600'}`}
            title="Feedback"
          >
            💬
          </button>
          <button 
            onClick={() => setActiveTab('absensi')}
            className={`w-12 h-12 rounded-lg flex items-center justify-center text-white transition ${activeTab === 'absensi' ? 'bg-teal-700' : 'hover:bg-teal-600'}`}
            title="Absensi"
          >
            ✅
          </button>
          <button 
            onClick={() => setActiveTab('jadwal')}
            className={`w-12 h-12 rounded-lg flex items-center justify-center text-white transition ${activeTab === 'jadwal' ? 'bg-teal-700' : 'hover:bg-teal-600'}`}
            title="Jadwal"
          >
            📅
          </button>
        </nav>

        <button className="w-12 h-12 rounded-lg flex items-center justify-center text-white hover:bg-teal-700 transition">
          ⚙️
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        
        {/* DASHBOARD TAB */}
        {activeTab === 'dashboard' && (
          <>
            <h1 className="text-2xl font-bold text-gray-800 mb-8">Admin Dashboard</h1>

            {/* Stats Cards */}
            <div className="grid grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm mb-2">Total Students</p>
                    <p className="text-3xl font-bold text-gray-900">43</p>
                    <p className="text-green-500 text-xs mt-1">+3.5%</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">👨‍🎓</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm mb-2">Active Classes</p>
                    <p className="text-3xl font-bold text-gray-900">5</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">📚</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm mb-2">Events Upcoming</p>
                    <p className="text-3xl font-bold text-gray-900">Family Gath</p>
                    <p className="text-gray-400 text-xs mt-1">In 2 days</p>
                  </div>
                  <div className="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">🎉</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Recent Activity</h2>
                <div className="space-y-4">
                  {[
                    { icon: '📄', title: 'New student enrolled: Aya', time: '2 minutes ago', color: 'bg-red-50' },
                    { icon: '💳', title: 'Payment received from Budi', time: '1 hour ago', color: 'bg-blue-50' },
                    { icon: '✅', title: 'Attendance marked for TK-A', time: '4 hours ago', color: 'bg-green-50' },
                    { icon: '📅', title: 'New event: Field Trip scheduled', time: '1 day ago', color: 'bg-orange-50' },
                  ].map((activity, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className={`w-10 h-10 ${activity.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                        <span className="text-lg">{activity.icon}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                        <p className="text-xs text-gray-500">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-gray-800">Attendance Overview</h2>
                  <button className="text-sm text-gray-500 hover:text-gray-700">View all</button>
                </div>
                
                <div className="h-48 flex items-end justify-between space-x-2">
                  {[
                    { day: 'M', value: 30 },
                    { day: 'T', value: 45 },
                    { day: 'W', value: 75 },
                    { day: 'T', value: 40 },
                    { day: 'F', value: 50 },
                    { day: 'S', value: 20 },
                    { day: 'S', value: 15 },
                  ].map((item, index) => (
                    <div key={index} className="flex-1 flex flex-col items-center space-y-2">
                      <div className="w-full bg-gray-100 rounded-t-lg relative overflow-hidden" style={{ height: '100%' }}>
                        <div 
                          className="absolute bottom-0 w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-lg transition-all duration-300"
                          style={{ height: `${item.value}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-500">{item.day}</span>
                    </div>
                  ))}
                </div>
                
                <div className="mt-4 flex items-center justify-center space-x-4 text-xs text-gray-500">
                  <div className="flex items-center space-x-1">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span>Present</span>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* UPLOAD FOTO KEGIATAN TAB */}
        {activeTab === 'upload' && (
          <>
            <h1 className="text-2xl font-bold text-gray-800 mb-8">Upload Foto Kegiatan</h1>
            
            <div className="grid grid-cols-2 gap-6">
              {/* Upload Form */}
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Upload Foto Baru</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Judul Kegiatan</label>
                    <input 
                      type="text" 
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      placeholder="Contoh: Lomba Mewarnai"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Deskripsi</label>
                    <textarea 
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      rows="3"
                      placeholder="Deskripsi kegiatan..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Kelas</label>
                    <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent">
                      <option value="">Semua Kelas</option>
                      <option value="tk-a">TK A</option>
                      <option value="tk-b">TK B</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Upload Foto</label>
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    />
                  </div>

                  {photoPreview && (
                    <div className="mt-4">
                      <p className="text-sm font-medium text-gray-700 mb-2">Preview:</p>
                      <img src={photoPreview} alt="Preview" className="w-full h-48 object-cover rounded-lg" />
                    </div>
                  )}

                  <button 
                    onClick={submitPhoto}
                    className="w-full bg-teal-600 text-white py-2 px-4 rounded-lg hover:bg-teal-700 transition font-medium"
                  >
                    Upload Foto
                  </button>
                </div>
              </div>

              {/* Recent Uploads */}
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Foto Terupload</h2>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {uploadedPhotos.length === 0 ? (
                    <p className="text-gray-500 text-sm">Belum ada foto yang diupload</p>
                  ) : (
                    uploadedPhotos.map((photo) => (
                      <div key={photo.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <img src={photo.url} alt="Activity" className="w-16 h-16 object-cover rounded" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">Foto Kegiatan</p>
                          <p className="text-xs text-gray-500">{new Date(photo.date).toLocaleString('id-ID')}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </>
        )}

        {/* NOTIFIKASI TAB */}
        {activeTab === 'notif' && (
          <>
            <h1 className="text-2xl font-bold text-gray-800 mb-8">Buat Notifikasi</h1>
            
            <div className="max-w-2xl">
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Kirim Notifikasi Baru</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tipe Notifikasi</label>
                    <div className="flex space-x-4">
                      <label className="flex items-center">
                        <input 
                          type="radio" 
                          name="notifType" 
                          value="umum"
                          checked={notifType === 'umum'}
                          onChange={(e) => setNotifType(e.target.value)}
                          className="mr-2"
                        />
                        <span className="text-sm">Umum (Semua Orang Tua)</span>
                      </label>
                      <label className="flex items-center">
                        <input 
                          type="radio" 
                          name="notifType" 
                          value="khusus"
                          checked={notifType === 'khusus'}
                          onChange={(e) => setNotifType(e.target.value)}
                          className="mr-2"
                        />
                        <span className="text-sm">Khusus (Per Kelas/Siswa)</span>
                      </label>
                    </div>
                  </div>

                  {notifType === 'khusus' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Pilih Kelas</label>
                      <select 
                        value={selectedClass}
                        onChange={(e) => setSelectedClass(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      >
                        <option value="">Pilih Kelas</option>
                        <option value="tk-a">TK A</option>
                        <option value="tk-b">TK B</option>
                      </select>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Judul Notifikasi</label>
                    <input 
                      type="text" 
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      placeholder="Contoh: Pengumuman Libur"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Pesan</label>
                    <textarea 
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      rows="4"
                      placeholder="Tulis pesan notifikasi..."
                    />
                  </div>

                  <button className="w-full bg-teal-600 text-white py-2 px-4 rounded-lg hover:bg-teal-700 transition font-medium">
                    Kirim Notifikasi
                  </button>
                </div>
              </div>

              {/* Recent Notifications */}
              <div className="bg-white rounded-2xl shadow-sm p-6 mt-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Notifikasi Terkirim</h2>
                <div className="space-y-3">
                  {[
                    { title: 'Libur Hari Raya', msg: 'Sekolah libur tanggal 10-15 Mei', type: 'Umum', time: '1 jam lalu' },
                    { title: 'Jadwal Field Trip', msg: 'TK B akan field trip ke kebun binatang', type: 'TK B', time: '3 jam lalu' },
                  ].map((notif, index) => (
                    <div key={index} className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{notif.title}</p>
                          <p className="text-sm text-gray-600 mt-1">{notif.msg}</p>
                          <div className="flex items-center space-x-2 mt-2">
                            <span className="text-xs bg-teal-100 text-teal-700 px-2 py-1 rounded">{notif.type}</span>
                            <span className="text-xs text-gray-500">{notif.time}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {/* FEEDBACK TAB */}
        {activeTab === 'feedback' && (
          <>
            <h1 className="text-2xl font-bold text-gray-800 mb-8">Feedback dari Orang Tua</h1>
            
            <div className="space-y-4">
              {[
                { name: 'Ibu Siti', student: 'Ahmad (TK A)', msg: 'Terima kasih atas perhatian guru-guru. Ahmad sangat senang di sekolah!', time: '10 menit lalu', status: 'unread' },
                { name: 'Bapak Budi', student: 'Rina (TK B)', msg: 'Mohon bisa ditambahkan kegiatan outdoor lebih banyak', time: '2 jam lalu', status: 'read' },
                { name: 'Ibu Ani', student: 'Devi (TK A)', msg: 'Jadwal kegiatan bulan depan kapan dibagikan?', time: '1 hari lalu', status: 'read' },
              ].map((feedback, index) => (
                <div key={index} className="bg-white rounded-2xl shadow-sm p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-xl">👤</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <p className="font-semibold text-gray-900">{feedback.name}</p>
                          {feedback.status === 'unread' && (
                            <span className="bg-red-500 w-2 h-2 rounded-full"></span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500">{feedback.student}</p>
                        <p className="text-gray-700 mt-2">{feedback.msg}</p>
                        <p className="text-xs text-gray-400 mt-2">{feedback.time}</p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition text-sm">
                        Balas
                      </button>
                      <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition text-sm">
                        Tandai Dibaca
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ABSENSI TAB */}
        {activeTab === 'absensi' && (
          <>
            <h1 className="text-2xl font-bold text-gray-800 mb-8">Absensi Siswa</h1>
            
            <div className="grid grid-cols-3 gap-6 mb-6">
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <p className="text-gray-500 text-sm mb-2">Hadir Hari Ini</p>
                <p className="text-3xl font-bold text-green-600">38/43</p>
                <p className="text-sm text-gray-500 mt-1">88.4%</p>
              </div>
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <p className="text-gray-500 text-sm mb-2">Izin/Sakit</p>
                <p className="text-3xl font-bold text-yellow-600">3</p>
              </div>
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <p className="text-gray-500 text-sm mb-2">Tanpa Keterangan</p>
                <p className="text-3xl font-bold text-red-600">2</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-800">Daftar Absensi Hari Ini</h2>
                <select className="px-4 py-2 border border-gray-300 rounded-lg">
                  <option>Semua Kelas</option>
                  <option>TK A</option>
                  <option>TK B</option>
                </select>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama Siswa</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kelas</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Jam Datang</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {[
                      { name: 'Ahmad Rizki', class: 'TK A', status: 'Hadir', time: '07:30' },
                      { name: 'Siti Nurhaliza', class: 'TK A', status: 'Hadir', time: '07:45' },
                      { name: 'Budi Santoso', class: 'TK B', status: 'Izin', time: '-' },
                      { name: 'Rina Wati', class: 'TK B', status: 'Hadir', time: '07:20' },
                    ].map((student, index) => (
                      <tr key={index}>
                        <td className="px-4 py-3 text-sm text-gray-900">{student.name}</td>
                        <td className="px-4 py-3 text-sm text-gray-500">{student.class}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            student.status === 'Hadir' ? 'bg-green-100 text-green-700' : 
                            student.status === 'Izin' ? 'bg-yellow-100 text-yellow-700' : 
                            'bg-red-100 text-red-700'
                          }`}>
                            {student.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">{student.time}</td>
                        <td className="px-4 py-3">
                          <button className="text-teal-600 hover:text-teal-700 text-sm font-medium">Edit</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* JADWAL TAB */}
        {activeTab === 'jadwal' && (
          <>
            <h1 className="text-2xl font-bold text-gray-800 mb-8">Manajemen Jadwal</h1>
            
            <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Tambah/Edit Jadwal</h2>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Hari</label>
                  <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500">
                    <option>Senin</option>
                    <option>Selasa</option>
                    <option>Rabu</option>
                    <option>Kamis</option>
                    <option>Jumat</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Kelas</label>
                  <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500">
                    <option>TK A</option>
                    <option>TK B</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Waktu Mulai</label>
                  <input type="time" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Waktu Selesai</label>
                  <input type="time" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500" />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nama Kegiatan</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                    placeholder="Contoh: Belajar Membaca"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Deskripsi</label>
                  <textarea 
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                    rows="2"
                    placeholder="Deskripsi kegiatan..."
                  />
                </div>
              </div>

              <button className="mt-4 bg-teal-600 text-white py-2 px-6 rounded-lg hover:bg-teal-700 transition font-medium">
                Simpan Jadwal
              </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Jadwal TK A - Minggu Ini</h2>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hari</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Waktu</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kegiatan</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {[
                      { day: 'Senin', time: '08:00 - 09:00', activity: 'Belajar Membaca' },
                      { day: 'Senin', time: '09:00 - 10:00', activity: 'Menggambar' },
                      { day: 'Selasa', time: '08:00 - 09:00', activity: 'Berhitung' },
                      { day: 'Rabu', time: '08:00 - 10:00', activity: 'Olahraga' },
                    ].map((schedule, index) => (
                      <tr key={index}>
                        <td className="px-4 py-3 text-sm text-gray-900">{schedule.day}</td>
                        <td className="px-4 py-3 text-sm text-gray-500">{schedule.time}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{schedule.activity}</td>
                        <td className="px-4 py-3 space-x-2">
                          <button className="text-teal-600 hover:text-teal-700 text-sm font-medium">Edit</button>
                          <button className="text-red-600 hover:text-red-700 text-sm font-medium">Hapus</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

      </main>
    </div>
  )
}

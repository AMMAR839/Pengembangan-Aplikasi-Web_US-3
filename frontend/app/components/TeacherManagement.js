'use client';

import { useState, useEffect } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function TeacherManagement() {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [token, setToken] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    nama: '',
    email: '',
    noHP: '',
    alamat: '',
    nip: '',
    kelas: '',
    status: 'active'
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedToken = localStorage.getItem('token');
      setToken(savedToken);
      if (savedToken) {
        fetchTeachers(savedToken);
      }
    }
  }, []);

  const fetchTeachers = async (authToken) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/teacher`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Gagal mengambil data guru');
      }

      const data = await response.json();
      setTeachers(data.data || []);
    } catch (err) {
      console.error('Fetch teachers error:', err);
      setError('Tidak dapat mengambil data guru');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const method = editingId ? 'PATCH' : 'POST';
      const url = editingId 
        ? `${API_URL}/api/teacher/${editingId}` 
        : `${API_URL}/api/teacher`;

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Gagal menyimpan data guru');
      }

      setFormData({
        nama: '',
        email: '',
        noHP: '',
        alamat: '',
        nip: '',
        kelas: '',
        status: 'active'
      });
      setEditingId(null);
      setShowForm(false);
      fetchTeachers(token);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEdit = (teacher) => {
    setFormData({
      nama: teacher.nama,
      email: teacher.email,
      noHP: teacher.noHP || '',
      alamat: teacher.alamat || '',
      nip: teacher.nip || '',
      kelas: teacher.kelas || '',
      status: teacher.status
    });
    setEditingId(teacher._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus guru ini?')) return;

    try {
      const response = await fetch(`${API_URL}/api/teacher/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Gagal menghapus guru');
      }

      fetchTeachers(token);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Manajemen Guru</h2>
        <button
          onClick={() => {
            setShowForm(!showForm);
            setEditingId(null);
            if (showForm) {
              setFormData({
                nama: '',
                email: '',
                noHP: '',
                alamat: '',
                nip: '',
                kelas: '',
                status: 'active'
              });
            }
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          {showForm ? 'Batal' : '+ Tambah Guru'}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {showForm && (
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">
            {editingId ? 'Edit Guru' : 'Tambah Guru Baru'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                name="nama"
                placeholder="Nama Guru"
                value={formData.nama}
                onChange={handleInputChange}
                required
                className="border border-gray-300 rounded-lg px-3 py-2"
              />
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="border border-gray-300 rounded-lg px-3 py-2"
              />
              <input
                type="tel"
                name="noHP"
                placeholder="No. HP"
                value={formData.noHP}
                onChange={handleInputChange}
                className="border border-gray-300 rounded-lg px-3 py-2"
              />
              <input
                type="text"
                name="nip"
                placeholder="NIP"
                value={formData.nip}
                onChange={handleInputChange}
                className="border border-gray-300 rounded-lg px-3 py-2"
              />
              <textarea
                name="alamat"
                placeholder="Alamat"
                value={formData.alamat}
                onChange={handleInputChange}
                className="border border-gray-300 rounded-lg px-3 py-2 col-span-2"
                rows="2"
              />
              <select
                name="kelas"
                value={formData.kelas}
                onChange={handleInputChange}
                className="border border-gray-300 rounded-lg px-3 py-2"
              >
                <option value="">Tidak Ada Kelas</option>
                <option value="A">Kelas A</option>
                <option value="B">Kelas B</option>
              </select>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="border border-gray-300 rounded-lg px-3 py-2"
              >
                <option value="active">Aktif</option>
                <option value="inactive">Tidak Aktif</option>
              </select>
            </div>
            <button
              type="submit"
              className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition"
            >
              {editingId ? 'Update Guru' : 'Tambah Guru'}
            </button>
          </form>
        </div>
      )}

      {loading ? (
        <div className="text-center py-8">
          <p className="text-gray-500">Memuat data guru...</p>
        </div>
      ) : teachers.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <p className="text-gray-500">Belum ada data guru</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Nama</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Email</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">No. HP</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Kelas</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {teachers.map((teacher) => (
                <tr key={teacher._id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="px-6 py-3 text-sm text-gray-900">{teacher.nama}</td>
                  <td className="px-6 py-3 text-sm text-gray-600">{teacher.email}</td>
                  <td className="px-6 py-3 text-sm text-gray-600">{teacher.noHP || '-'}</td>
                  <td className="px-6 py-3 text-sm text-gray-600">{teacher.kelas || '-'}</td>
                  <td className="px-6 py-3 text-sm">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      teacher.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {teacher.status === 'active' ? 'Aktif' : 'Tidak Aktif'}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-sm space-x-2">
                    <button
                      onClick={() => handleEdit(teacher)}
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(teacher._id)}
                      className="text-red-600 hover:text-red-800 font-medium"
                    >
                      Hapus
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

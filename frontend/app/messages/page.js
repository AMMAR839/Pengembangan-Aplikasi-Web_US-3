'use client';

import { useState, useEffect } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function MessagesPage() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [role, setRole] = useState('');
  const [token, setToken] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedToken = localStorage.getItem('token');
      const savedRole = localStorage.getItem('role');
      setToken(savedToken);
      setRole(savedRole);
      
      if (savedToken) {
        fetchMessages(savedToken);
      }
    }
  }, []);

  const fetchMessages = async (authToken) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/messages/inbox`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Gagal mengambil pesan');
      }

      const data = await response.json();
      setMessages(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Fetch messages error:', err);
      setError('Tidak dapat mengambil pesan');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!token) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">Silakan login terlebih dahulu</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Pesan</h1>
        <p className="text-gray-600 mb-6">
          {role === 'parent' ? 'Pesan dari guru dan admin' : 'Inbox pesan'}
        </p>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-gray-500">Memuat pesan...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <p className="text-gray-500">Belum ada pesan</p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg) => (
              <div
                key={msg._id}
                className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-blue-500 hover:shadow-md transition"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {role === 'parent'
                        ? msg.teacherId?.username || 'Guru'
                        : msg.studentId?.nama || 'Siswa'}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {msg.studentId?.nama && role === 'admin' && (
                        <>
                          <span className="inline-block mr-2">👤</span>
                          {msg.studentId.nama}
                        </>
                      )}
                    </p>
                  </div>
                  <span className="text-xs text-gray-400 whitespace-nowrap">
                    {formatDate(msg.createdAt)}
                  </span>
                </div>

                <p className="text-gray-700 leading-relaxed">{msg.content}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

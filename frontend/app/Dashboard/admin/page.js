'use client'

export default function AdminDashboard() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-20 bg-[#0A231A] flex flex-col items-center py-6 space-y-8">
        <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center">
          <span className="text-[#0A231A] font-bold text-xs">🌱</span>
        </div>
        
        <nav className="flex-1 flex flex-col space-y-6">
          <button className="w-12 h-12 rounded-lg bg-teal-700 flex items-center justify-center text-white hover:bg-teal-500 transition">
            👤
          </button>
        </nav>

        <button className="w-12 h-12 rounded-lg flex items-center justify-center text-white hover:bg-teal-700 transition">
          ⚙️
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-8">Admin Dashboard</h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          {/* Total Students */}
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

          {/* Active Classes */}
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

          {/* Events Upcoming */}
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

        {/* Recent Activity & Chart */}
        <div className="grid grid-cols-2 gap-6">
          {/* Recent Activity */}
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

          {/* Attendance Chart */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-800">Attendance Overview</h2>
              <button className="text-sm text-gray-500 hover:text-gray-700">View all</button>
            </div>
            
            {/* Simple Bar Chart */}
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
            
            {/* Chart Legend */}
            <div className="mt-4 flex items-center justify-center space-x-4 text-xs text-gray-500">
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span>Present</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

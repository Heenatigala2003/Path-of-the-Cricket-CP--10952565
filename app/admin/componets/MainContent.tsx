export default function MainContent() {
  return (
    <div className="flex-1 p-6">
      {/* Admin Profile */}
      <div className="mb-8 p-6 bg-gray-800 rounded-xl border border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-amber-600 rounded-full flex items-center justify-center">
              <span className="text-2xl font-bold">TH</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-amber-500">Theekshana Heenatigala</h2>
              <div className="flex items-center gap-4 mt-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-gray-300">Status: <span className="text-green-400">Active</span></span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-300">Role: <span className="text-amber-400">Super Admin</span></span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* User Activity Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
          <h3 className="text-lg font-bold text-amber-500 mb-4">User Activity Stats</h3>
          <div className="mb-6">
            <div className="text-3xl font-bold">15,234</div>
            <div className="text-gray-400">Global Active Users</div>
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span>Posts</span>
              <span className="font-bold text-xl">320</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Comments</span>
              <span className="font-bold text-xl">145</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Logins</span>
              <span className="font-bold text-xl">568</span>
            </div>
          </div>
        </div>

        {/* Active Users Overview */}
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
          <h3 className="text-lg font-bold text-amber-500 mb-4">Active Users Overview</h3>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between mb-2">
                <span>Sessions</span>
                <span className="font-bold">65%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div className="bg-amber-500 h-2 rounded-full" style={{ width: '65%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span>New Users</span>
                <span className="font-bold">25%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '25%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span>Returning Users</span>
                <span className="font-bold">10%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: '10%' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Traffic & Engagement */}
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
          <h3 className="text-lg font-bold text-amber-500 mb-4">Traffic & Engagement</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-900 p-4 rounded-lg">
              <div className="text-2xl font-bold">100%</div>
              <div className="text-sm text-gray-400">Page Views</div>
            </div>
            <div className="bg-gray-900 p-4 rounded-lg">
              <div className="text-2xl font-bold">100%</div>
              <div className="text-sm text-gray-400">Registrations</div>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
          <h3 className="text-lg font-bold text-amber-500 mb-4">Performance Metrics</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-900 p-4 rounded-lg">
              <div className="text-xl font-bold">Revenue</div>
              <div className="text-sm text-gray-400 mt-1">View Report</div>
            </div>
            <div className="bg-gray-900 p-4 rounded-lg">
              <div className="text-xl font-bold">Transactions</div>
              <div className="text-sm text-gray-400 mt-1">View Report</div>
            </div>
          </div>
          <button className="w-full mt-4 p-3 bg-amber-600 hover:bg-amber-700 rounded-lg transition-colors">
            View Website
          </button>
        </div>

        {/* Growth Metrics */}
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
          <h3 className="text-lg font-bold text-amber-500 mb-4">Growth Metrics</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-900 p-4 rounded-lg">
              <div className="text-xl font-bold">Online Users</div>
              <div className="text-sm text-gray-400 mt-1">Real-time</div>
            </div>
            <div className="bg-gray-900 p-4 rounded-lg">
              <div className="text-xl font-bold">New Signups</div>
              <div className="text-sm text-gray-400 mt-1">Today</div>
            </div>
            <div className="bg-gray-900 p-4 rounded-lg">
              <div className="text-xl font-bold">Revenue</div>
              <div className="text-sm text-gray-400 mt-1">This Month</div>
            </div>
            <div className="bg-gray-900 p-4 rounded-lg">
              <div className="text-xl font-bold">Transactions</div>
              <div className="text-sm text-gray-400 mt-1">Total</div>
            </div>
          </div>
          <div className="mt-4 bg-gray-900 p-4 rounded-lg">
            <div className="text-xl font-bold">Conversion Rate</div>
            <div className="text-sm text-gray-400 mt-1">Performance</div>
          </div>
        </div>
      </div>

      {/* About Section */}
      <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 mb-8">
        <h2 className="text-2xl font-bold text-amber-500 mb-4">PATH OF THE CRICKET</h2>
        <p className="text-gray-300 mb-6">
          Path of the Cricketer & Talent Portal is dedicated to nurturing future cricketing talent in Sri Lanka. 
          Working closely with Sri Lanka Cricket, we provide resources, training, and opportunities for aspiring cricketers.
        </p>
        
        <div className="grid grid-cols-3 sm:grid-cols-9 gap-2">
          {[...Array(9)].map((_, i) => (
            <div key={i} className="bg-gray-900 p-4 rounded-lg text-center">
              <div className="text-sm">Partner {i + 1}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
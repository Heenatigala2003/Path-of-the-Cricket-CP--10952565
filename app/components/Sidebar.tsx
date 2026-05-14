
export default function AdminSidebar() {
  return (
    <div className="w-64 bg-gray-800 text-white">
      <h2 className="p-4 text-xl font-bold">Admin Panel</h2>
      <nav className="p-4">
        <ul className="space-y-2">
          <li><a href="/admin" className="block p-2 hover:bg-gray-700">Dashboard</a></li>
          <li><a href="/admin/users" className="block p-2 hover:bg-gray-700">Users</a></li>
          <li><a href="/admin/matches" className="block p-2 hover:bg-gray-700">Matches</a></li>
        </ul>
      </nav>
    </div>
  );
}
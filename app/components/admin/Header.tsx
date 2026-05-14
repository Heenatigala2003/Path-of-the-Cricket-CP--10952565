export default function AdminHeader() {
  return (
    <header className="bg-white shadow p-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <div className="flex items-center space-x-4">
          <span>Admin User</span>
          <button className="bg-red-500 text-white px-4 py-2 rounded">Logout</button>
        </div>
      </div>
    </header>
  );
}
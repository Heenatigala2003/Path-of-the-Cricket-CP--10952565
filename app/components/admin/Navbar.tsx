// components/admin/Navbar.jsx
"use client"; // Add this if you're using React hooks

export default function Navbar() {
  return (
    <nav className="admin-navbar">
      <div className="navbar-container">
        <div className="navbar-left">
          <h1>Cricket Admin Dashboard</h1>
        </div>
        <div className="navbar-right">
          <button className="profile-btn">Admin Profile</button>
          <button className="logout-btn">Logout</button>
        </div>
      </div>
    </nav>
  );
}
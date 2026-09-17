import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const response = await fetch("http://localhost:5000/api/user/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message);
        }

        setUser(data.user);
      } catch (error) {
        localStorage.removeItem("token");
        setError(error.message);
        navigate("/login");
      }
    };

    fetchProfile();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  if (!user) {
    return <div className="loading-page">Loading...</div>;
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-card">
        <div className="dashboard-header">
          <div>
            <p className="eyebrow">JWT AUTHENTICATION</p>

            <h1>Welcome, {user.name} 👋</h1>
          </div>

          <button className="logout-button" onClick={handleLogout}>
            Logout
          </button>
        </div>

        <div className="profile-section">
          <div className="profile-item">
            <span>User ID</span>
            <strong>{user.id}</strong>
          </div>

          <div className="profile-item">
            <span>Name</span>
            <strong>{user.name}</strong>
          </div>

          <div className="profile-item">
            <span>Email</span>
            <strong>{user.email}</strong>
          </div>

          <div className="profile-item">
            <span>Role</span>
            <strong>{user.role}</strong>
          </div>
        </div>

        <div className="authenticated-badge">✓ JWT verified successfully</div>
      </div>
    </div>
  );
}

export default Dashboard;

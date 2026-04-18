import { useState, useEffect } from "react";
import API from "../api/axios";

const STATUS_COLORS = {
  RECEIVED: "#6366f1",
  PROCESSING: "#f59e0b",
  READY: "#22c55e",
  DELIVERED: "#06b6d4",
};

const STATUS_ICONS = {
  RECEIVED: "📥",
  PROCESSING: "⚙️",
  READY: "✅",
  DELIVERED: "🚚",
};

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await API.get("/orders/dashboard");
      setStats(res.data.data);
    } catch (err) {
      console.error("Failed to load dashboard", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!stats) {
    return <div className="page-content"><p>Failed to load dashboard data.</p></div>;
  }

  return (
    <div className="page-content">
      <h2 className="page-title">Dashboard</h2>

      <div className="stats-grid">
        <div className="stat-card stat-total">
          <div className="stat-icon">📦</div>
          <div className="stat-info">
            <span className="stat-value">{stats.totalOrders}</span>
            <span className="stat-label">Total Orders</span>
          </div>
        </div>

        <div className="stat-card stat-revenue">
          <div className="stat-icon">💰</div>
          <div className="stat-info">
            <span className="stat-value">₹{stats.totalRevenue.toLocaleString()}</span>
            <span className="stat-label">Total Revenue</span>
          </div>
        </div>
      </div>

      <h3 className="section-title">Orders by Status</h3>
      <div className="status-grid">
        {Object.entries(stats.ordersPerStatus).map(([status, count]) => (
          <div
            key={status}
            className="status-card"
            style={{ borderLeftColor: STATUS_COLORS[status] }}
          >
            <div className="status-card-icon">{STATUS_ICONS[status]}</div>
            <div className="status-card-info">
              <span className="status-card-count">{count}</span>
              <span className="status-card-label">{status}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;

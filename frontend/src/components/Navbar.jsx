import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  if (!user) return null;

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/">🧺 LaundryPro</Link>
      </div>
      <div className="navbar-links">
        <Link to="/" className={isActive("/") ? "active" : ""}>
          Dashboard
        </Link>
        <Link to="/orders" className={isActive("/orders") ? "active" : ""}>
          Orders
        </Link>
        <Link
          to="/orders/new"
          className={isActive("/orders/new") ? "active" : ""}
        >
          New Order
        </Link>
      </div>
      <div className="navbar-user">
        <span className="user-badge">{user.username}</span>
        <button onClick={logout} className="btn btn-logout">
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;

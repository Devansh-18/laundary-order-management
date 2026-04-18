import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import API from "../api/axios";
import { toast } from "react-toastify";

const STATUS_FLOW = ["RECEIVED", "PROCESSING", "READY", "DELIVERED"];
const STATUS_COLORS = {
  RECEIVED: "#6366f1",
  PROCESSING: "#f59e0b",
  READY: "#22c55e",
  DELIVERED: "#06b6d4",
};

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: "",
    customerName: "",
    phoneNumber: "",
    garmentType: "",
  });
  const [pagination, setPagination] = useState({ page: 1, pages: 1 });

  useEffect(() => {
    fetchOrders();
  }, [filters, pagination.page]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = { page: pagination.page, limit: 10 };
      if (filters.status) params.status = filters.status;
      if (filters.customerName) params.customerName = filters.customerName;
      if (filters.phoneNumber) params.phoneNumber = filters.phoneNumber;
      if (filters.garmentType) params.garmentType = filters.garmentType;

      const res = await API.get("/orders", { params });
      setOrders(res.data.data);
      setPagination((prev) => ({
        ...prev,
        pages: res.data.pagination.pages,
        total: res.data.pagination.total,
      }));
    } catch (err) {
      console.error("Failed to load orders", err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      await API.patch(`/orders/${orderId}/status`, { status: newStatus });
      toast.success(`Status updated to ${newStatus}`);
      fetchOrders();
    } catch (err) {
      toast.error(err.response?.data?.message || "Status update failed");
    }
  };

  const getNextStatus = (currentStatus) => {
    const idx = STATUS_FLOW.indexOf(currentStatus);
    return idx < STATUS_FLOW.length - 1 ? STATUS_FLOW[idx + 1] : null;
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const clearFilters = () => {
    setFilters({ status: "", customerName: "", phoneNumber: "", garmentType: "" });
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  return (
    <div className="page-content">
      <div className="page-header">
        <h2 className="page-title">Orders</h2>
        <Link to="/orders/new" className="btn btn-primary">
          + New Order
        </Link>
      </div>

      {/* Filters */}
      <div className="filters-bar">
        <input
          type="text"
          name="customerName"
          placeholder="Search by name..."
          value={filters.customerName}
          onChange={handleFilterChange}
        />
        <input
          type="text"
          name="phoneNumber"
          placeholder="Search by phone..."
          value={filters.phoneNumber}
          onChange={handleFilterChange}
        />
        <input
          type="text"
          name="garmentType"
          placeholder="Search by garment..."
          value={filters.garmentType}
          onChange={handleFilterChange}
        />
        <select name="status" value={filters.status} onChange={handleFilterChange}>
          <option value="">All Status</option>
          {STATUS_FLOW.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <button className="btn btn-secondary" onClick={clearFilters}>
          Clear
        </button>
      </div>

      {/* Orders Table */}
      {loading ? (
        <div className="loading-screen">
          <div className="spinner"></div>
        </div>
      ) : orders.length === 0 ? (
        <div className="empty-state">
          <p>No orders found</p>
        </div>
      ) : (
        <>
          <div className="table-container">
            <table className="orders-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Phone</th>
                  <th>Items</th>
                  <th>Amount</th>
                  <th>Est. Delivery</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => {
                  const nextStatus = getNextStatus(order.status);
                  return (
                    <tr key={order._id}>
                      <td className="order-id">{order.orderId}</td>
                      <td>{order.customerName}</td>
                      <td>{order.phoneNumber}</td>
                      <td>
                        {order.items.map((item, i) => (
                          <span key={i} className="item-tag">
                            {item.garmentType} ×{item.quantity}
                          </span>
                        ))}
                      </td>
                      <td className="amount">₹{order.totalAmount}</td>
                      <td>
                        {order.estimatedDeliveryDate
                          ? new Date(order.estimatedDeliveryDate).toLocaleDateString()
                          : "—"}
                      </td>
                      <td>
                        <span
                          className="status-badge"
                          style={{ backgroundColor: STATUS_COLORS[order.status] }}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td>
                        {nextStatus ? (
                          <button
                            className="btn btn-sm btn-advance"
                            onClick={() => handleStatusUpdate(order._id, nextStatus)}
                          >
                            → {nextStatus}
                          </button>
                        ) : (
                          <span className="text-muted">Completed</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="pagination">
              <button
                disabled={pagination.page <= 1}
                onClick={() =>
                  setPagination((prev) => ({ ...prev, page: prev.page - 1 }))
                }
                className="btn btn-secondary"
              >
                ← Prev
              </button>
              <span>
                Page {pagination.page} of {pagination.pages}
              </span>
              <button
                disabled={pagination.page >= pagination.pages}
                onClick={() =>
                  setPagination((prev) => ({ ...prev, page: prev.page + 1 }))
                }
                className="btn btn-secondary"
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Orders;

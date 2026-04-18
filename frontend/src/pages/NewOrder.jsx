import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import { toast } from "react-toastify";

const GARMENT_TYPES = [
  "Shirt",
  "Pant",
  "T-Shirt",
  "Jeans",
  "Suit",
  "Saree",
  "Kurta",
  "Jacket",
  "Bedsheet",
  "Curtain",
  "Towel",
  "Other",
];

const NewOrder = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    customerName: "",
    phoneNumber: "",
    estimatedDeliveryDate: "",
    items: [{ garmentType: "Shirt", quantity: 1, pricePerItem: 0 }],
  });

  const addItem = () => {
    setForm({
      ...form,
      items: [...form.items, { garmentType: "Shirt", quantity: 1, pricePerItem: 0 }],
    });
  };

  const removeItem = (index) => {
    if (form.items.length === 1) return;
    setForm({
      ...form,
      items: form.items.filter((_, i) => i !== index),
    });
  };

  const updateItem = (index, field, value) => {
    const newItems = [...form.items];
    newItems[index][field] = field === "garmentType" ? value : Number(value);
    setForm({ ...form, items: newItems });
  };

  const calculateTotal = () => {
    return form.items.reduce((sum, item) => sum + item.quantity * item.pricePerItem, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        customerName: form.customerName,
        phoneNumber: form.phoneNumber,
        items: form.items,
      };
      if (form.estimatedDeliveryDate) {
        payload.estimatedDeliveryDate = form.estimatedDeliveryDate;
      }
      await API.post("/orders", payload);
      toast.success("Order created successfully!");
      navigate("/orders");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create order");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-content">
      <h2 className="page-title">Create New Order</h2>

      <form onSubmit={handleSubmit} className="order-form">
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="customerName">Customer Name</label>
            <input
              id="customerName"
              type="text"
              placeholder="John Doe"
              value={form.customerName}
              onChange={(e) => setForm({ ...form, customerName: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="phoneNumber">Phone Number</label>
            <input
              id="phoneNumber"
              type="text"
              placeholder="+91 9876543210"
              value={form.phoneNumber}
              onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="estimatedDeliveryDate">Est. Delivery Date</label>
            <input
              id="estimatedDeliveryDate"
              type="date"
              value={form.estimatedDeliveryDate}
              onChange={(e) =>
                setForm({ ...form, estimatedDeliveryDate: e.target.value })
              }
            />
          </div>
        </div>

        <h3 className="section-title">Items</h3>
        <div className="items-list">
          {form.items.map((item, index) => (
            <div key={index} className="item-row">
              <div className="form-group">
                <label>Garment Type</label>
                <select
                  value={item.garmentType}
                  onChange={(e) => updateItem(index, "garmentType", e.target.value)}
                >
                  {GARMENT_TYPES.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Quantity</label>
                <input
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(e) => updateItem(index, "quantity", e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Price / Item (₹)</label>
                <input
                  type="number"
                  min="0"
                  value={item.pricePerItem}
                  onChange={(e) => updateItem(index, "pricePerItem", e.target.value)}
                  required
                />
              </div>
              <div className="form-group item-total">
                <label>Subtotal</label>
                <span className="subtotal-value">₹{item.quantity * item.pricePerItem}</span>
              </div>
              <button
                type="button"
                className="btn btn-remove"
                onClick={() => removeItem(index)}
                disabled={form.items.length === 1}
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        <button type="button" className="btn btn-secondary" onClick={addItem}>
          + Add Item
        </button>

        <div className="order-total">
          <span>Total Amount:</span>
          <span className="total-value">₹{calculateTotal()}</span>
        </div>

        <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
          {loading ? "Creating..." : "Create Order"}
        </button>
      </form>
    </div>
  );
};

export default NewOrder;

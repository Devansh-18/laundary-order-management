# 🧺 LaundryPro - Order Management System

A professional, full-stack order management solution designed for laundry businesses. This project focuses on high-quality code architecture, seamless user experience, and efficient data handling.

---

## 🚀 Features Implemented

- **Secure Authentication**: JWT-based login and registration system with role-based access (Admin/Staff).
- **Order Lifecycle Management**: Complete workflow from order creation to final delivery.
- **Unified Search**: A powerful, multi-field search engine that finds orders by Customer Name, Phone Number, or Garment Type instantly.
- **Interactive Dashboard**: Real-time statistics including total revenue, order counts, and status breakdowns.
- **Intelligent Status Tracking**: Enforced status transitions (RECEIVED → PROCESSING → READY → DELIVERED) to ensure operational consistency.
- **Optimized UI**: Polished forms with automatic input selection and real-time subtotal calculations.

---

## 🛠️ Tech Stack

- **Frontend**: React (Vite), Axios, React Router 7, React Toastify.
- **Backend**: Node.js, Express.js.
- **Database**: MongoDB with Mongoose ODM.
- **Security**: JWT (JSON Web Tokens), Bcrypt.js for password hashing.

---

## 📋 Setup Instructions

### Prerequisites
- Node.js installed.
- MongoDB instance (local or Atlas).

### 1. Backend Setup
```bash
cd backend
npm install
```
Create a `.env` file in the `backend` folder:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_key
JWT_EXPIRES_IN=7d
```
Run the server:
```bash
npm run dev
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
The app will be available at `http://localhost:5173`.

---

## 🤖 AI Usage Report

This project leveraged state-of-the-art AI tools (**ChatGPT-4** and **Google Gemini 3.1 Pro**) to accelerate development while maintaining high architectural standards.

### How AI was Utilized:
- **Architectural Refactoring**: Initially, business calculations were handled within Mongoose hooks. I used AI to refactor this logic into Dedicated Controllers. This improved the separation of concerns and made the models "thinner" and more maintainable.
- **Feature Engineering**: AI helped in designing the **Unified Search** logic, providing the precise MongoDB `$or` aggregation patterns needed to search across related models and sub-documents efficiently.
- **UI Polishing**: Prompted AI to help resolve tricky CSS and React input behaviors, specifically the "leading zero" issue in numeric inputs, resulting in a much smoother data entry experience.

### Sample Prompts Used:
> *"Refactor the order calculation logic from Mongoose pre-save hooks into the OrderController to ensure the model remains purely a schema definition."*

> *"Write a MongoDB query that performs a case-insensitive search across customerName, phoneNumber, and an array of items with a 'garmentType' field."*

### What AI Got Wrong & My Improvements:
- **Middleware handling**: One AI suggestion used an outdated `next()` callback pattern in an `async` Mongoose hook, which led to a crash. I identified the conflict with modern Promise-based middleware and standardized the entire backend to use `async/await` without callbacks.
- **State Management**: AI initially suggested individual states for every filter. I improved this by consolidating them into a single `filters` object and a unified `search` parameter, significantly reducing re-renders and simplifying the code.

---

## ⚖️ Tradeoffs & Future Improvements

### Tradeoffs made:
- **Linear Status Flow**: Currently, orders can only move forward one step at a time. While this prevents mistakes, some businesses might need the flexibility to skip steps or roll back.
- **Local Storage Auth**: Used `localStorage` for JWT storage for simplicity. In a high-security production environment, moving to `HttpOnly` cookies would be the preferred next step.

### What I'd improve with more time:
- **Image Uploads**: I would implement Multer/Cloudinary support to allow staff to upload photos of garments at the time of "RECEIVED" to document their initial condition.
- **Automated Notifications**: Integrate Twilio or WhatsApp API to automatically notify customers when their order status changes to "READY".
- **Advanced Analytics**: Add graphs (Recharts) to show revenue trends over weeks or months on the dashboard.

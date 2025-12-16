# ✈️ Flight Booking System (MERN Stack)

A full-stack **Flight Booking System** built using the **MERN stack** (MongoDB, Express, React, Node.js) with dynamic pricing, wallet management, and PDF ticket generation.

This project demonstrates real-world backend logic, database usage, and clean frontend integration.

---

## 🚀 Features

### ✅ Flight Search (Database-Driven)
- Flights are fetched directly from MongoDB
- Search by **departure city** and **arrival city**
- 10–20 pre-seeded flights (no static JSON / APIs)

### 🔥 Dynamic Pricing Engine
- If a flight is booked multiple times within a short window, price increases by **10%**
- Price resets after the surge window expires
- Surge indicator shown on UI

### 💰 Wallet System
- Default wallet balance: **₹50,000**
- Balance deducted on successful booking
- Validation for insufficient balance
- Wallet persisted in MongoDB

### 🎟 Ticket Booking & PDF Generation
- Unique **PNR** generated for every booking
- Downloadable PDF ticket includes:
  - Passenger Name
  - Flight Details
  - Route
  - Price Paid
  - Booking Date & Time

### 📜 Booking History (Backend Ready)
- Bookings stored in MongoDB
- Can be extended to UI easily

---

## 🧱 Tech Stack

### Frontend
- React
- TailwindCSS
- Axios
- Context API

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- PDFKit

---

## 📁 Project Structure

flight-booking/
│
├── backend/
│ ├── server.js
│ ├── models/
│ ├── routes/
│ ├── package.json
│
├── frontend/
│ ├── src/
│ │ ├── components/
│ │ ├── pages/
│ │ ├── context/
│ │ └── App.jsx
│ ├── package.json
│
└── README.md

yaml
Copy code

---

## ⚙️ Setup Instructions

### 🔹 1️⃣ Clone Repository
```bash
git clone https://github.com/<your-username>/flight-booking-system.git
cd flight-booking-system
🔹 2️⃣ Backend Setup
bash
Copy code
cd backend
npm install
npm run dev
Backend runs at:

arduino
Copy code
http://localhost:3001
🔹 3️⃣ Seed Database (One-Time)
Open in browser:

bash
Copy code
http://localhost:3001/api/seed
🔹 4️⃣ Frontend Setup
bash
Copy code
cd ../frontend
npm install
npm start
Frontend runs at:

arduino
Copy code
http://localhost:3000
🧪 API Endpoints
Method	Endpoint	Description
GET	/api/flights/search	Search flights
POST	/api/flights/calculate-price/:id	Dynamic pricing
POST	/api/book/:id	Book flight
GET	/api/ticket/:pnr/pdf	Download ticket
GET	/api/user/wallet	Wallet balance
GET	/api/seed	Seed database (dev only)

🔐 Authentication (Planned)
Authentication is intentionally deferred.
Current version uses a single-user wallet.
Architecture supports easy JWT-based authentication in future.

🎯 Future Enhancements
User login & registration

Multi-user wallets

Booking history UI

Admin flight management

Docker deployment

👤 Author
Yusra Azeem
Full-Stack Developer | MERN | Java

⭐ Notes
This project was built as a technical assignment to demonstrate end-to-end system design, backend logic, and frontend integration.

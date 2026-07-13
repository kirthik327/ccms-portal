# 🏛️ Campus Complaint Management System (CCMS)

A secure, modern, and confidential **Campus Complaint Management System (CCMS)** designed for college students to submit grievances, upload supporting photo attachments, and track the resolution status of their complaints in real time. The system also features a robust Admin Dashboard for college authorities to review, filter, and resolve issues efficiently.

---

## 📸 Screenshots

To help you visualize the platform's inner panels and features without needing credentials, here are screenshots of the application:

### 🔑 Portal Login
![Login Screen](./screenshots/login.png)

### 🎓 Student Dashboard
![Student Dashboard](./screenshots/student_dashboard.png)

### ✍️ Grievance Submission Form (With Attachments)
![Grievance Form](./screenshots/grievance_form.png)

### 🛠️ Admin Resolution Panel
![Admin Dashboard](./screenshots/admin_dashboard.png)

---

## 🚀 Key Features

### 👤 Student Features
- **Secure Authentication:** Log in safely using college Roll Number credentials.
- **Submit Complaints:** Categorize grievances (e.g., Hostel, Academic, Infrastructure, Canteen) and provide detailed descriptions.
- **Supporting Media:** Attach photos as evidence for complaints.
- **Track Status:** Monitor the life cycle of submitted grievances (Submitted ➔ In Progress ➔ Resolved) with real-time status badges.

### 💼 Admin & Staff Features
- **Grievance Management:** View all submitted complaints across the campus in one central inbox.
- **Department Filters:** Quickly sort complaints by department or category.
- **Update Status:** Change complaint states and leave official remarks explaining actions taken.
- **Overview Metrics:** Check statistics on resolved vs. pending grievances.

---

## 🛠️ Technology Stack

- **Frontend:** React.js, Tailwind CSS (Styling), Axios (API calls), Lucide React (Icons), Vite
- **Backend:** Node.js, Express.js, Multer (Local static file uploads)
- **Database:** MongoDB Atlas (Mongoose ODM)
- **Hosting:** 
  - Frontend: Vercel
  - Backend: Render

---

## ⚙️ Local Development Setup

To run the project locally on your machine, follow these steps:

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/kirthik327/ccms-portal.git
cd ccms-portal
```

### 2️⃣ Configure Environment Variables
Create a `.env` file inside the `backend` folder and add the following keys:
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
```

### 3️⃣ Start Backend Server
```bash
cd backend
npm install
npm start
```

### 4️⃣ Start Frontend Server
```bash
cd ../frontend
npm install
npm run dev
```
Open [http://localhost:5173](https://ccms-portal-gules.vercel.app/) in your browser to view the application.

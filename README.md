# 🎓 CCMS: Campus Complaint Management System

A modern, responsive, and secure MERN-stack web application designed for colleges and universities to manage, track, and resolve student grievances efficiently.

---

## 🚀 Key Features

* **Dual-Method Authentication**: Students can securely log in using either their **Register Number** or registered **Email Address**.
* **Secure OTP Password Reset**: A 3-step password recovery wizard with automatic secure Gmail OTP dispatch and a 30-second resend cooldown timer.
* **Role-Based Dashboards**:
  * **Students**: Submit complaints, upload proof/images, reply to updates, view case statuses, and manage profile emails.
  * **Admin / Staff**: Assign complaints to specific staff, update statuses (Submitted, Assigned, Resolved), and view interactive inflow trends.
* **Registered User Directory**: A secure administrative panel listing registered students' details (Names and Roll Numbers).
* **Tactile KPI Cards**: Admin metrics that toggle list views dynamically upon click.
* **Premium Aesthetics**: Responsive glassmorphic layout, fluid flexboxes, global text copy protection, and modern dark-mode support.

---

## 🛠️ Technology Stack

* **Frontend**: React.js, Tailwind CSS v4, Lucide Icons, Axios, Recharts (for trend analytics).
* **Backend**: Node.js, Express.js, JWT Authentication, Nodemailer (SMTP email delivery).
* **Database**: MongoDB (via Mongoose ODM) with cloud database integration on MongoDB Atlas.
* **Process Manager**: PM2 (for 24/7 background hosting).

---

## 💻 Local Setup & Installation

### Prerequisites
* [Node.js](https://nodejs.org/) installed on your computer.
* A [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) account (or local MongoDB service).

### 1. Clone the Codebase
If you have Git installed, clone the repository:
```bash
git clone https://github.com/kirthik327/ccms-portal.git
cd ccms-portal
```

### 2. Configure Environment Variables
Create a file named `.env` inside the `backend/` directory:
```env
PORT=5000
MONGODB_URI=mongodb+srv://yourUsername:yourPassword@cluster0.xxxx.mongodb.net/ccms
JWT_SECRET=yourSuperSecretJWTKey123
EMAIL_USER=yourGmailAddress@gmail.com
EMAIL_PASS=your16CharGmailAppPassword
```

### 3. Build & Start the Application
To run the production-ready build:

* **Build the Frontend**:
  ```bash
  cd frontend
  npm install
  npm run build
  ```
* **Start the Backend**:
  ```bash
  cd ../backend 
  npm install
  npm start
  ```
The website will be online at: (https://ccms-portal-gules.vercel.app)

---

## ☁️ Deploying to the Cloud for Free
To make this website permanently public so anyone can visit it without your laptop being on, refer to our detailed step-by-step guides:
* **Free Hosting Guide**: See [free_hosting_guide.md](./free_hosting_guide.md) to host it on **Render.com**.
* **Official Launch Guide**: See [official_website_launch_guide.md](./official_website_launch_guide.md) for custom domains and VPS deployment.

---

## 📄 License
This project is open-source and available under the [MIT License](LICENSE).

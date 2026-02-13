<div align="center">
  
  # 🤝 AERO-CONNECT
  ### *Inter-Departmental Grievance Management System*
  <!-- Badges -->
  <p align="center">
    <a href="https://github.com/Abskrdev20/AERO-CONNECT/stargazers"><img src="https://img.shields.io/github/stars/Abskrdev20/AERO-CONNECT?style=for-the-badge&logo=github&color=f4c430" alt="Stars"/></a>
    <a href="https://github.com/Abskrdev20/AERO-CONNECT/network/members"><img src="https://img.shields.io/github/forks/Abskrdev20/AERO-CONNECT?style=for-the-badge&logo=git&color=blue" alt="Forks"/></a>
    <a href="https://github.com/Abskrdev20/AERO-CONNECT/blob/main/LICENSE"><img src="https://img.shields.io/github/license/Abskrdev20/AERO-CONNECT?style=for-the-badge&logo=opensourceinitiative&color=green" alt="License"/></a>
    <a href="https://render.com"><img src="https://img.shields.io/badge/Deployed%20on-Render-46E3B7?style=for-the-badge&logo=render" alt="Render"/></a>
  </p>
</div>

## 📖 Overview

**AERO-CONNECT** is a comprehensive **inter-departmental grievance redressal portal** built exclusively for the **Airports Authority of India (AAI)**. This unified digital platform empowers employees, interns, and apprentices to **raise**, **track**, and **resolve** workplace grievances with complete **transparency** and **accountability**.
<p align="center">
  <a href="https://drive.google.com/file/d/13hOVXx3hiTYCwVhjMOg2PTx5eBvOetdQ/view?usp=sharing" target="_blank">
    <img src="https://img.shields.io/badge/ 📜 Deep Dive : Explore comprehensive project insights and indepth documentation-View_Report-orange?style=for-the-badge" alt="Project Report" height="32"/>
  </a>
</p>

## ✨ Key Features

<table align="center" >
  <tr>
    <td align="center" width="25%">
      <img src="https://img.icons8.com/fluency/96/ticket.png" width="48"/><br/>
      <b>Unique Ticket ID</b><br/>
      <sub>Auto-generated IDs like<br/><code>AAI-GRV-2026-00001</code></sub>
    </td>
    <td align="center" width="25%">
      <img src="https://img.icons8.com/fluency/96/search.png" width="48"/><br/>
      <b>Real-Time Tracking</b><br/>
      <sub>Live status updates from<br/>submission to resolution</sub>
    </td>
    <td align="center" width="25%">
      <img src="https://img.icons8.com/fluency/96/attach.png" width="48"/><br/>
      <b>File Attachments</b><br/>
      <sub>Upload up to 5MB supporting<br/>documents per grievance</sub>
    </td>
    <td align="center" width="25%">
      <img src="https://img.icons8.com/fluency/96/dashboard.png" width="48"/><br/>
      <b>Admin Dashboard</b><br/>
      <sub>Review, escalate & resolve<br/>grievances efficiently</sub>
    </td>
  </tr>
  <tr>
    <td align="center" width="25%">
      <img src="https://img.icons8.com/fluency/96/email.png" width="48"/><br/>
      <b>Email Notifications</b><br/>
      <sub>Automated updates via<br/>Nodemailer integration</sub>
    </td>
    <td align="center" width="25%">
      <img src="https://img.icons8.com/fluency/96/security-checked.png" width="48"/><br/>
      <b>Secure Auth</b><br/>
      <sub>bcrypt encryption &<br/>session-based security</sub>
    </td>
    <td align="center" width="25%">
      <img src="https://img.icons8.com/fluency/96/bar-chart.png" width="48"/><br/>
      <b>Analytics</b><br/>
      <sub>Grievance statistics &<br/>status summaries</sub>
    </td>
    <td align="center" width="25%">
      <img src="https://img.icons8.com/fluency/96/groups.png" width="48"/><br/>
      <b>Role-Based Access</b><br/>
      <sub>Employee, Dept Admin<br/>& Super Admin roles</sub>
    </td>
  </tr>
</table>

---

## 🎬 Video Walkthrough

Experience the full capabilities of AERO-CONNECT. Click the thumbnail below to watch the demonstration.

<div align="center">
  <a href="https://www.youtube.com/watch?v=NrEH-RpQskA" target="_blank">
    <img src="https://img.youtube.com/vi/NrEH-RpQskA/maxresdefault.jpg" alt="AERO-CONNECT Video Demo" width="80%" style="border-radius: 25px; box-shadow: 0px 4px 12px rgba(0,0,0,0.3);"/>
  </a>
  <p><em>👆 Click to play the video demonstration</em></p>
</div>

---

## 📁 Project Structure

```bash
AERO-CONNECT/
├── client/                 # Frontend Assets & Views
│   ├── public/             # Static files (Images, CSS, JS)
│   └── views/              # EJS Templates (UI Layouts)
├── server/                 # Backend Logic
│   ├── controllers/        # Business logic & Request handlers
│   ├── models/             # Mongoose Data Models (Schemas)
│   ├── routes/             # API & Page Routes
│   ├── middleware/         # Auth & Validation Middleware
│   └── utils/              # Helper functions (Email, Cloudinary)
├── .env                    # Environment configurations (GitIgnored)
├── app.js                  # Application Entry Point
├── package.json            # Project metadata and dependencies
└── README.md               # Documentation
```

---
## 🛠️ Tech Stack

<table>
  <tr>
    <th align="center">🔧 Category</th>
    <th align="center">⚡ Technology</th>
    <th align="center">📝 Purpose</th>
  </tr>
  <tr>
    <td rowspan="4"><b>Backend</b></td>
    <td><img src="https://img.shields.io/badge/Node.js-339933?style=flat&logo=nodedotjs&logoColor=white"/> v18+</td>
    <td>Runtime Environment</td>
  </tr>
  <tr>
    <td><img src="https://img.shields.io/badge/Express.js-000000?style=flat&logo=express&logoColor=white"/> v5.2.1</td>
    <td>Web Framework</td>
  </tr>
  <tr>
    <td><img src="https://img.shields.io/badge/MongoDB-47A248?style=flat&logo=mongodb&logoColor=white"/> v7.0</td>
    <td>NoSQL Database</td>
  </tr>
  <tr>
    <td><img src="https://img.shields.io/badge/Mongoose-880000?style=flat&logo=mongoose&logoColor=white"/> v9.1.4</td>
    <td>ODM Library</td>
  </tr>
  <tr>
    <td rowspan="3"><b>Frontend</b></td>
    <td><img src="https://img.shields.io/badge/EJS-B4CA65?style=flat&logo=ejs&logoColor=black"/> v4.0.1</td>
    <td>Server-side Templating</td>
  </tr>
  <tr>
    <td><img src="https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white"/> <img src="https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3&logoColor=white"/></td>
    <td>Markup & Styling</td>
  </tr>
  <tr>
    <td><img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black"/> ES6+</td>
    <td>Client Interactivity</td>
  </tr>
  <tr>
    <td rowspan="2"><b>Security</b></td>
    <td><img src="https://img.shields.io/badge/bcrypt-003A70?style=flat&logo=letsencrypt&logoColor=white"/> v6.0</td>
    <td>Password Hashing</td>
  </tr>
  <tr>
    <td><img src="https://img.shields.io/badge/express--session-000000?style=flat&logo=express&logoColor=white"/> v1.18</td>
    <td>Session Management</td>
  </tr>
  <tr>
    <td rowspan="2"><b>Cloud & Email</b></td>
    <td><img src="https://img.shields.io/badge/Cloudinary-3448C5?style=flat&logo=cloudinary&logoColor=white"/> v2.9</td>
    <td>File Storage</td>
  </tr>
  <tr>
    <td><img src="https://img.shields.io/badge/Nodemailer-339933?style=flat&logo=minutemailer&logoColor=white"/> v7.0</td>
    <td>Email Notifications</td>
  </tr>
</table>

## 🚀 Installation

```bash
# 1️⃣ Clone the repository
git clone https://github.com/Abskrdev20/AERO-CONNECT.git

# 2️⃣ Navigate to project directory
cd AERO-CONNECT

# 3️⃣ Install dependencies (use legacy-peer-deps for compatibility)
npm install --legacy-peer-deps

# 4️⃣ Create environment file
cp .env.example .env

# 5️⃣ Configure your environment variables
# Edit .env with your MongoDB URI, Cloudinary credentials, etc.

# 6️⃣ Start the application
node app.js
```
## 🎖️ Contributing
Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are greatly appreciated.

<div align="center"> 
<a href="https://github.com/Abskrdev20/AERO-CONNECT/stargazers"> <img src="https://img.shields.io/badge/⭐%20Star%20This%20Repository-FFD700?style=for-the-badge&logo=github&logoColor=black" alt="Star Repo"/> </a> <a href="https://github.com/Abskrdev20/AERO-CONNECT/fork"> <img src="https://img.shields.io/badge/🍴%20Fork%20This%20Repository-0066FF?style=for-the-badge&logo=git&logoColor=white" alt="Fork Repo"/> </a>
<br/>
❤️ Made with love for the Airports Authority of India (AAI)
<p> Crafted by the <strong>AERO-CONNECT Team</strong>. </p>
<sub>© 2026 AERO-CONNECT | All Rights Reserved</sub>
</div> 

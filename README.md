# NeoConnect – Complaint Management System (Frontend)

![Next.js](https://img.shields.io/badge/Next.js-14-black)
![React](https://img.shields.io/badge/React-Frontend-blue)
![Node.js](https://img.shields.io/badge/Node.js-Backend-green)
![Express](https://img.shields.io/badge/Express-API-lightgrey)
![MongoDB](https://img.shields.io/badge/MongoDB-Database-green)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-UI-blue)

---

## Project Repositories

| Service  | Repository                                                |
| -------- | --------------------------------------------------------- |
| Frontend | https://github.com/ManojkumarDevarapu/neoconnect-frontend |
| Backend  | https://github.com/ManojkumarDevarapu/neoconnect-backend  |

---

## Key Highlights

* Role-based complaint management system
* Anonymous complaint submission
* Case assignment workflow
* Internal polling system for staff feedback
* Analytics dashboard with visual insights
* Transparency hub for reports and meeting archives

---

NeoConnect is a **role-based complaint and case management platform** designed to help organizations collect feedback, manage complaints, track resolution workflows, and maintain transparency.

The frontend application is built using **Next.js 14, React, and TailwindCSS**, providing a responsive and intuitive interface for different organizational roles including **Staff, Secretariat, Case Managers, and Administrators**.

The application communicates with a **Node.js + Express REST API backend** backed by **MongoDB** for data storage.

---

# System Architecture

NeoConnect follows a **modern full-stack architecture** where the frontend communicates with backend APIs to perform complaint submission, case management, polling, and analytics operations.

![System Architecture](docs/screenshots/architecture.png)

Architecture Flow:

```
User
   │
   ▼
Next.js Frontend
   │
Axios API Requests
   │
Node.js + Express REST API
   │
MongoDB Database
```

---

# Technology Stack

Frontend technologies used:

* **Next.js 14**
* **React**
* **TailwindCSS**
* **Axios**
* **Recharts (Analytics Visualizations)**
* **Context API (Authentication State)**
* **ShadCN UI Components**

---

# Key Features

### Secure Authentication

Users can securely **register and log in** to access the platform based on their assigned roles.

### Complaint Submission

Staff members can submit complaints with:

* category
* severity level
* department
* location
* detailed description
* optional file attachment

### Case Tracking

Each complaint receives a **unique tracking ID** allowing users to track case progress.

### Role-Based Access Control

Different users have different dashboards and permissions:

| Role         | Responsibilities                                 |
| ------------ | ------------------------------------------------ |
| Staff        | Submit and track complaints                      |
| Secretariat  | Assign cases to case managers                    |
| Case Manager | Monitor cases and update statuses                |
| Admin        | System oversight, analytics, and user management |

### Poll System

Internal polling system allows staff to vote on workplace improvements.

### Analytics Dashboard

Administrators can view **data visualizations and statistics** of complaints across the organization.

### Transparency Hub

Public hub for transparency reports and meeting archives.

---

# Application Screenshots

## Authentication

### Login Page

Users authenticate using their organizational credentials.

![Login](docs/screenshots/login.page.png)

---

### Register Page

New users can register and select their role and department.

![Register](docs/screenshots/register.page.png)

---

# Staff Interface

Staff members primarily interact with the system by submitting complaints and tracking their submissions.

### Staff Dashboard

Shows complaint statistics and recent cases submitted by the user.

![Staff Dashboard](docs/screenshots/staff.dashboard.png)

---

### Submit a Complaint

Staff can submit a new complaint with detailed information and optional file attachments.

![Submit Case](docs/screenshots/staff.case.png)

---

# Secretariat Interface

Secretariat members coordinate the complaint workflow by assigning cases.

### Secretariat Dashboard

Displays recent cases and system overview.

![Secretariat Dashboard](docs/screenshots/Secretariat.dashboard.png)

---

### Assign Case to Case Manager

Secretariat members assign complaints to appropriate case managers.

![Assign Case](docs/screenshots/Secretariat.assign.png)

---

# Case Manager Interface

Case managers monitor complaints and track their progress.

### Case Manager Dashboard

Shows case statistics and recently assigned complaints.

![Case Manager Dashboard](docs/screenshots/casemanager.dashboard.png)

---

# Administrator Interface

Administrators oversee the entire system and manage users, analytics, and complaints.

---

### Admin Dashboard

Provides a summary of all complaints in the system.

![Admin Dashboard](docs/screenshots/admin.dashboard.png)

---

### Manage All Cases

Administrators can view and filter all complaints across the organization.

![All Cases](docs/screenshots/admin.allcases.png)

---

### Complaint Analytics

Visual dashboards showing complaint statistics by category, severity, and department.

![Analytics](docs/screenshots/admin.analytics.png)

---

### Poll Management

Admins can create and manage polls for organizational feedback.

![Add Poll](docs/screenshots/admin.addpoll.png)

---

### Transparency Hub

Provides transparency reports, meeting minutes, and organizational updates.

![Public Hub](docs/screenshots/admin.hub.png)

---

### User Management

Administrators can manage users, assign roles, and maintain system access.

![User Management](docs/screenshots/admin.usermanagement.png)

---

# Project Structure

```
frontend
│
├── docs
│   └── screenshots
│
├── src
│   ├── app
│   ├── components
│   ├── context
│   ├── utils
│   └── styles
│
├── public
├── package.json
└── README.md
```

---

# Installation

Clone the repository:

```
git clone https://github.com/yourusername/neoconnect-frontend.git
```

Navigate into the project directory:

```
cd neoconnect-frontend
```

Install dependencies:

```
npm install
```

---

# Running the Application

Start the development server:

```
npm run dev
```

The application will run at:

```
http://localhost:3000
```

---

# API Communication

The frontend communicates with the backend using **Axios**.

Example request:

```javascript
axios.get("/api/cases")
```

---

# Future Improvements

Potential enhancements:

* Real-time notifications
* Email alerts for complaint updates
* Mobile optimized interface
* Advanced analytics dashboards
* Audit logs for case activities

---

# Author

Developed as part of the **NeoConnect Complaint Management System** project.

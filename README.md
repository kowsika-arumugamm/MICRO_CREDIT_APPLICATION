# MICRO_CREDIT_APPLICATION

## Overview
This project is a Micro Credit Application built with:
- **Frontend:** React (TypeScript)
- **Backend:** Node.js (TypeScript, Express)
- **Database:** PostgreSQL

The application allows micro-credit operations such as user management, credit requests, and approvals.

---

## Repository Structure
MICRO_CREDIT_APPLICATION/
│
├── client/ # React frontend
│ ├── src/
│ └── package.json
│
├── server/ # Node.js backend (TypeScript)
│ ├── src/
│ └── package.json
│
└── README.md

---

## Prerequisites
- **Node.js** v18+
- **PostgreSQL** v14+
- **npm** or **yarn**
- **Git**

---

## Environment Variables

### Backend (`server/.env`)
DATABASE_URL=postgres://<user>:<password>@localhost:5432/<database_name>
PORT=5000
JWT_SECRET=your_jwt_secret


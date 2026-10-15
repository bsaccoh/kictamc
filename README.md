# Kenema ICT & Management College (KICTAMC) — Student Application Portal

[![Build Status](https://img.shields.io/badge/Build-Passing-brightgreen)]()
[![Tests](https://img.shields.io/badge/Test%20Suites-6%20Passed%20%7C%2041%20Tests-brightgreen)]()
[![Database](https://img.shields.io/badge/PostgreSQL-17-blue)]()
[![Prisma](https://img.shields.io/badge/Prisma-6.4-blueviolet)]()
[![React](https://img.shields.io/badge/React-18-cyan)]()
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue)]()

Production-oriented full-stack web application for the **Kenema ICT & Management College (KICTAMC)**, Kenema, Eastern Province, Sierra Leone.

---

## 🏛️ Project Overview

This repository delivers **Phase 1: Student Application Portal & Admissions Administration Console** of the KICTAMC College Management Ecosystem. It provides an end-to-end digital admissions workflow tailored to Sierra Leone's higher-education requirements, qualification tiers (Lower Diploma, Higher Diploma, and Degree programs), local banking channels (SLCB, Rokel Commercial Bank, Orange Money, Afrimoney), and administrative verification.

---

## 🚀 Key Features

### 1. Student Portal & Multi-Step Application Wizard
- **Applicant Authentication**: Secure signup with Bcrypt (12 rounds), HttpOnly SameSite JWT cookies, contact verification, password reset.
- **Progressive Draft Auto-Save**: Multi-step wizard supporting real-time draft saving across sessions:
  - **Step 1: Personal Profile**: Name, gender, nationality, date of birth, marital status.
  - **Step 2: Geographic Origin (Sierra Leone)**: Cascaded regional selector: Province/Region -> District -> Chiefdom -> Town/City.
  - **Step 3: Guardian & Contact**: Next of kin and emergency contact information.
  - **Step 4: Academic Program Selection**: Dependent dropdowns by qualification level (Lower Diploma, Higher Diploma, Degree) and department.
  - **Step 5: Educational History & Grades**: Tabular examination entry (e.g., WASSCE, BECE) with candidate index numbers and subject-by-subject grades.
  - **Step 6: Document Checklist**: Upload tracking against course requirements.
- **Submission Engine**: Atomic validation ensuring all mandatory documents and academic criteria are satisfied before submission, capturing an immutable audit snapshot of course fees in Sierra Leone Leones (`SLE`) and generating a unique application reference (`KICTAMC-2026-XXXXXX`).

### 2. Document Uploads & Magic Byte Verification
- Secure multi-format document uploader (PDF, PNG, JPG).
- **Magic byte signature validation** (e.g. `%PDF`, PNG, JPEG headers) preventing MIME spoofing.
- Unique UUID-based storage isolation outside the web root (`storage/documents/`).
- Private streaming endpoints (`/api/v1/documents/:id/file`) with object-level permission controls.

### 3. Payment Processing & Cryptographic Confirmation Tokens
- **Local Payment Channels**:
  - **Sierra Leone Commercial Bank (SLCB)** (Kenema Branch)
  - **Rokel Commercial Bank (RCBank)** (Hangha Road Branch)
  - **Orange Money Sierra Leone** (`*144*4*1*23489#`)
  - **Afrimoney Sierra Leone** (`*161*2*9023#`)
  - **Simulated Instant Online Gateway (Sandbox)**: One-click card/mobile checkout simulation.
- **Manual Verification Workflow**: Students upload bank deposit slips or mobile transfer screenshots. Payment stays in `PENDING_VERIFICATION` until verified by the Finance Office.
- **Cryptographic Token Generator**: Upon approval by Finance, the system issues a cryptographically unique token (`KICTAMC-PAY-XXXXXXXX`), marks the payment `PAID`, and advances the application to `UNDER_REVIEW`.
- **Public & Staff Token Verification Portal** (`/verify-token`): Allows third parties, employers, sponsors, and staff to verify the authenticity of any token against the college ledger.
- **Printable Official Receipt** (`/receipt/:id`): Formal receipt featuring college crest, confirmation token badge, verification date, and student particulars.

### 4. Administrative Operations & Admissions Board Console
- **Role-Based Access Control (RBAC)**:
  - `APPLICANT`: Can draft, upload documents, pay fees, and track progress.
  - `ADMISSIONS_OFFICER`: Reviews student dossiers, verifies academic credentials, requests applicant corrections, and renders admission decisions (`APPROVED` / `REJECTED`).
  - `FINANCE_OFFICER`: Manages the payment ledger, inspects teller receipts, and approves/rejects payments.
  - `SYSTEM_ADMIN`: Full access to academic catalogs, intake dates, user directory, and security audit trail.
- **Admissions Review Toolbox**:
  - Full candidate dossier view.
  - Correction request modal (alerts applicant and updates status to `ACTION_REQUIRED`).
  - Formal Board Decision with decision remarks.
- **Real-Time Operational Statistics** (`/api/v1/admin/stats`): Real-time metrics for total applications, breakdown by status, fee collections, and active courses.
- **Security Audit Trail** (`/admin/audit`): Complete audit history logging timestamps, staff actions, and IP/user agents.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, TypeScript 5.8, Vite 6, Tailwind CSS (KICTAMC Navy `#0B2545` & Gold `#D4AF37`), React Router 6, TanStack Query 5, Lucide Icons |
| **Backend** | Express 5, TypeScript 5.8, Prisma 6.4 ORM, Bcrypt, JsonWebToken, Multer, Zod, Winston |
| **Database** | PostgreSQL 17 (Relational, 17 Schema Models) |
| **Testing** | Jest 29, Supertest 7, Ts-Jest (41 Automated Integration Tests) |

---

## ⚙️ Setup and Installation

### Prerequisites
- Node.js 18+ (or 20+)
- PostgreSQL 16+ or 17 running locally on port `5432`

### 1. Clone & Install Dependencies
```bash
# Backend dependencies
cd backend
npm install

# Frontend dependencies
cd ../frontend
npm install
```

### 2. Configure Environment Variables
Create `.env` in the root and in `backend/`:
```env
PORT=5000
NODE_ENV=development
DATABASE_URL="postgresql://postgres@127.0.0.1:5432/kictamc_portal?schema=public"
JWT_SECRET="kictamc_super_secure_jwt_secret_key_2026_dev_env"
JWT_EXPIRES_IN="7d"
COOKIE_SECRET="kictamc_cookie_secret_key_99482103984"
FRONTEND_URL="http://localhost:5173"
STORAGE_BASE_DIR="storage"
```

### 3. Initialize & Seed Database
```bash
cd backend
npx prisma db push
npx prisma db seed
```

### 4. Run Automated Test Suites
```bash
cd backend
npm test
```
*Expected: 6 test suites passed, 41 tests passed (Auth, Academic, Applications, Documents, Payments, Admissions).*

### 5. Build for Production
```bash
# Frontend production bundle
cd frontend
npm run build

# Backend compilation
cd ../backend
npx tsc --noEmit
```

### 6. Start Development Servers
```bash
# Start backend server (Port 5000)
cd backend
npm run dev

# In a separate terminal, start frontend (Port 5173)
cd frontend
npm run dev
```

---

## 🔄 End-to-End Verification Walkthrough

1. **Student Registration**:
   - Navigate to `http://localhost:5173/register` and create an applicant account.
2. **Application Wizard**:
   - Log in and fill Steps 1 to 6 (Personal info, Eastern Province / Kenema, educational history with grades).
3. **Document Upload**:
   - Upload genuine or sample PDF credentials (tested against magic byte validation).
4. **Submit Application**:
   - Accept truthfulness declaration and submit. An application reference e.g., `KICTAMC-2026-XXXXXX` is generated and status moves to `AWAITING_PAYMENT`.
5. **Fee Payment**:
   - Choose **Bank Deposit (SLCB / RCBank)** or **Orange/Afrimoney**, provide the teller slip, and submit.
   - Or click **Instant Online Payment Simulator** for immediate token generation.
6. **Finance Verification**:
   - Log in as `finance@kictamc.edu.sl` -> Go to **Payments Ledger** (`/admin/payments`).
   - Inspect the teller slip and click **Approve & Issue Confirmation Token**.
   - Cryptographic token e.g., `KICTAMC-PAY-7F3A9C82` is issued.
7. **Token Verification & Receipt**:
   - Publicly verify token at `http://localhost:5173/verify-token`.
   - Print the formal receipt from the applicant tracking dashboard.
8. **Admissions Board Review & Decision**:
   - Log in as `admissions@kictamc.edu.sl` -> Open **Admissions Applications** (`/admin/applications`).
   - Inspect student dossier -> Click **Approve for Admission** with congratulatory remarks.
   - Status updates to `APPROVED` and student receives in-app acceptance offer.

---

## ☁️ Cloud Deployment (Render & Neon DB)

This application is pre-configured for 1-click or automated deployment on **Render** (Frontend & Backend) and **Neon.tech** (Serverless PostgreSQL):

- **Render Blueprint**: [`render.yaml`](render.yaml) automatically provisions both the Node.js backend Web Service and the React static site with SPA routing.
- **Detailed Step-by-Step Instructions**: Refer to the complete **[Deployment Guide](DEPLOYMENT.md)** for instructions on provisioning your Neon database, configuring environment variables, running database seeds, and testing the live application.

---

## 📜 License
Developed for Kenema ICT & Management College (KICTAMC), Sierra Leone. All rights reserved.

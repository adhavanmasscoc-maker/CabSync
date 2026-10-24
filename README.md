# CIT CabSync

> Mobile-first campus ride pooling and instant fare-splitting web app for Chennai Institute of Technology students.

[![Google Cloud](https://img.shields.io/badge/Google_Cloud-4285F4?style=flat-square&logo=google-cloud&logoColor=white)](https://cloud.google.com/)
[![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=flat-square&logo=firebase&logoColor=black)](https://firebase.google.com/)
[![Material Design 3](https://img.shields.io/badge/Material_Design_3-79747E?style=flat-square&logo=material-design&logoColor=white)](https://m3.material.io/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](./LICENSE)

---

## Why CabSync?

Students commuting between CIT campus and major transit hubs (Tambaram, Kilambakkam Bus Terminus, Egmore, and Central) regularly book cabs individually or struggle to split rides:

* **High Solo Cab Fares:** An Ola/Uber to Kilambakkam or Central often costs ₹500–₹800, which is expensive for a single student.
* **Messy Fare Splitting:** After a shared ride, leaders waste time calculating split amounts, requesting change, or tracking who paid whom.
* **Privacy Concerns:** Coordinating rides on public messaging groups exposes personal phone numbers to strangers.

CabSync solves this by pairing students traveling along identical routes at the same time, calculating fair splits automatically, and facilitating instant UPI payments.

---

## Core Features & Fare Splitting

### 1. Instant, Zero-Fee Fare Splitting
* **Automated Fare Calculation:** The ride leader inputs the final meter or app fare (e.g. ₹600 for 4 students = ₹150/passenger).
* **Direct UPI Deep Linking:** CabSync creates native `upi://pay` links and displays a pinned GPay/PhonePe QR code directly in the match lobby.
* **Zero Intermediary Fees:** Money moves directly student-to-student via UPI without payment gateway cuts or transaction charges.

### 2. Institutional Authentication (`@citchennai.net`)
* Access is strictly restricted to verified CIT student Google accounts.
* Auto-extracts student name, department, and graduation year to build trustworthy lobby profiles without manual onboarding.

### 3. Ephemeral Lobby & Private Coordination
* Coordinate pickup spots and timing inside an isolated real-time lobby chat.
* **Auto-Purge Lifecycle:** Chat history and lobby records are automatically wiped 1 hour after the scheduled departure. No phone numbers are ever stored or shared.

### 4. Smart Luggage Guard
* Ensures passengers don't overwhelm vehicle boot space by accounting for backpacks versus large trolley bags during match creation.

### 5. Verified Female-Only Pool
* Optional preference toggle allowing female students to match exclusively with verified female peers.
* Verified via fast, in-memory college ID card optical check with zero disk storage.

---

## Architecture & Tech Stack

```
CIT CabSync (PWA)
 ├── UI System: Google Material Design 3 (Google Blue #1A73E8, 48px touch targets)
 ├── Hosting: Firebase Hosting (Global CDN, HTTP/2 delivery)
 ├── Identity: Google Identity Services (restricted to @citchennai.net)
 ├── Database: Cloud Firestore (Real-time snapshots & atomic transactions)
 ├── Verification: Google Cloud Vision API (in-memory OCR, zero-disk persistence)
 └── Scheduled Cleanup: Cloud Functions (automatic post-ride data purge)
```

For complete technical specifications, database schema diagrams, and Firestore transaction implementations, see [cabsync_core_architecture_spec.md](./cabsync_core_architecture_spec.md).

---

## Repository Structure

```
cabsync/
├── .gitignore                          # Build & environment ignore rules
├── LICENSE                             # MIT License
├── README.md                           # Documentation & project overview
└── cabsync_core_architecture_spec.md   # Production architecture specification
```

---

## Getting Started

### Prerequisites
* Node.js (v18 or higher)
* Firebase CLI (`npm install -g firebase-tools`)
* A valid `@citchennai.net` Google Account for authentication testing

### Local Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/adhavanmasscoc-maker/CabSync.git
   cd CabSync
   ```

2. **Configure Firebase:**
   ```bash
   firebase login
   firebase use <your-project-id>
   ```

3. **Install and run the dev server:**
   ```bash
   npm install
   npm run dev
   ```

---

## Git Commit & Release Protocol

This repository follows [Conventional Commits v1.0.0](https://www.conventionalcommits.org/). Micro-commits (*"fixed bug"*, *"updated button"*, *"wip"*) are rejected. Every commit must be an atomic, compilable functional milestone.

See [Section 9 of the Architecture Spec](./cabsync_core_architecture_spec.md#9-professional-git-version-control--release-engineering-protocol) for the full 5-milestone commit roadmap.

---

## License

This project is licensed under the MIT License — see the [LICENSE](./LICENSE) file for details.

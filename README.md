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

## Core Features & Solutions

### 1. Instant, Zero-Fee Fare Splitting & UPI Deep Links
* **Automated Split Calculation:** The ride leader enters the final meter or app fare (e.g., ₹600 for 4 passengers = ₹150 each).
* **Direct 1-Tap UPI Links:** Generates native `upi://pay` deep links and displays a pinned high-contrast GPay/PhonePe QR code directly in the lobby view.
* **Zero Intermediary Fees:** Money moves directly peer-to-peer via UPI without payment gateway processing cuts or KYC compliance overhead.

### 2. Institutional Authentication & Profile Auto-Extraction
* **Domain-Restricted Auth:** Exclusively restricted to `@citchennai.net` Google accounts; non-institutional emails are blocked at the authentication boundary.
* **Smart Identity Parsing:** Automatically decomposes authenticated email strings upon login to populate passenger cards with Name, Department, and Batch Year (e.g., extracting "2025" to display 2nd-year status) with zero manual onboarding friction.

### 3. Concurrency-Safe Luggage Knapsack Engine
* **Physical Vehicle Capacity Limits:** Enforces strict integer point limits per vehicle class (Auto = 4 pts, Sedan = 7 pts, XL = 10 pts) accounting for backpacks (1 pt) and hard-shell trolleys (2 pts).
* **Race-Condition Prevention:** All join requests execute inside atomic Firestore transactions. If concurrent users attempt to join and their combined luggage exceeds the vehicle limit, the transaction automatically aborts to prevent boot overflow.

### 4. Ephemeral Female-Only Pool & Multi-Tier Verification
* **In-Memory Optical Verification:** Female students snap a live camera photo of their physical CIT ID for text extraction via Google Cloud Vision API. The image is processed in RAM and discarded immediately without persisting to Cloud Storage.
* **Automatic Name Matching:** Compares the extracted ID text against the authenticated Google account name.
* **Community Fallback ("Pending State"):** Flagged or unclear scans generate a secure verification hash requiring authorized confirmation clicks from 3 already-verified female student UIDs.

### 5. Self-Destructing Lobby Chat & Group Moderation
* **Private Route Coordination:** Real-time Firestore chat lets passengers coordinate pickup spots and departure times without ever exchanging phone numbers.
* **Automated 1-Hour TTL Purge:** A background Cloud Function automatically deletes the chat collection exactly 1 hour after the scheduled departure time.
* **Democratic "Vote Out" Moderation:** Ride documents maintain a vote-out array requiring majority approval (e.g., 2 votes in a 4-person pool) to remove a disruptive passenger. The voting mechanism automatically locks 45 minutes prior to departure to prevent stranded riders.

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

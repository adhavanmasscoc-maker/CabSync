# CIT CabSync

> Mobile-first campus cab pooling PWA with luggage capacity tracking, student privacy isolation, and zero-fee peer fare splitting. Built for **GDG HackBuild '26**.

[![Google Cloud](https://img.shields.io/badge/Google_Cloud-4285F4?style=flat-square&logo=google-cloud&logoColor=white)](https://cloud.google.com/)
[![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=flat-square&logo=firebase&logoColor=black)](https://firebase.google.com/)
[![Material Design 3](https://img.shields.io/badge/Material_Design_3-79747E?style=flat-square&logo=material-design&logoColor=white)](https://m3.material.io/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](./LICENSE)

---

## The Problem

Students traveling between suburban campuses (Chennai Institute of Technology) and major transport hubs (Tambaram, Kilambakkam, Egmore, Central) face three friction points:

1. **Boot-Space Exhaustion:** Standard 4-seater cabs have limited boot volume. Four students carrying hard-shell trolleys cannot physically fit their luggage into a sedan, causing rides to cancel at the curb.
2. **PII & Privacy Leakage:** Coordinating rides across unofficial WhatsApp groups exposes personal phone numbers to strangers.
3. **Bill Splitting Friction:** Manual calculations for split fares, cash change, and toll fees lead to awkward coordination.

---

## The Solution

CabSync solves campus transit coordination without storing personal contact numbers or overfilling vehicle boots:

* **Luggage Knapsack Engine:** Enforces integer point quotas per vehicle before anyone can join a lobby (Auto: 4 pts, Sedan: 7 pts, XL: 10 pts).
* **Institutional Google Sign-In:** Gated strictly to `@citchennai.net` Google accounts. Passenger profiles (name, department, batch year) are extracted directly from the email token.
* **Zero PII Exchange:** Communication takes place in an ephemeral lobby chat that is automatically deleted 1 hour after departure time. No phone numbers are ever stored or shared.
* **In-Memory ID Verification:** Female-only cab pools are verified via Google Cloud Vision API OCR running strictly in RAM (images are processed and immediately discarded without writing to storage).
* **Direct UPI Settlement:** Trip leaders display a pinned high-contrast UPI QR code (GPay/PhonePe) or generate one-tap deep links (`upi://pay`), eliminating payment gateway fees.

---

## Luggage Capacity Rules

| Vehicle Type | Max Seats | Max Luggage Units | Examples |
| :--- | :---: | :---: | :--- |
| **Auto Rickshaw** | 3 | **4 Units** | Bajaj Compact, TVS King |
| **Prime Sedan** | 4 | **7 Units** | Swift Dzire, Toyota Etios, Hyundai Aura |
| **Prime SUV / XL** | 6 | **10 Units** | Maruti Ertiga, Toyota Innova Crysta |

> **Point Calculation:** Backpack/Laptop Bag = **1 Unit** | Medium Trolley (20-24") = **2 Units** | Trunk (28"+) = **3 Units**

---

## Architecture & Tech Stack

```
CIT CabSync (PWA)
 ├── UI Layer: Material Design 3 (M3) Design System (Google Blue #1A73E8, 48px touch targets)
 ├── Hosting: Firebase Hosting (HTTP/2 edge delivery)
 ├── Identity: Google Identity Services (restricted to @citchennai.net)
 ├── Database: Cloud Firestore (Real-time snapshots & ACID transactions)
 ├── Ephemeral Verification: Cloud Vision API (in-memory OCR, zero-disk persistence)
 └── Cleanup Worker: Cloud Functions / Cloud Scheduler (TTL purge 1 hr post-trip)
```

For complete technical specifications, database schema diagrams, and Firestore transaction implementations, see [cabsync_core_architecture_spec.md](./cabsync_core_architecture_spec.md).

---

## Repository Structure

```
CabSync/
├── .gitignore                          # Clean ignore rules for web & Firebase
├── LICENSE                             # MIT License
├── README.md                           # Project documentation & overview
├── cabsync_core_architecture_spec.md   # System architecture, schemas & Git roadmap
├── Minimal_UI.md                       # Prototype screen & visual requirements
├── info.txt                            # Original problem & feature brief
└── CIT_CabSync_Pitch_Deck.pptx         # Hackathon pitch presentation
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
   git clone https://github.com/<your-username>/CabSync.git
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

This repository follows [Conventional Commits v1.0.0](https://www.conventionalcommits.org/). Micro-commits (*"fixed bug"*, *"updated button"*, *"wip"*) are not accepted. Every commit must be an atomic, compilable functional milestone.

See [Section 9 of the Architecture Spec](./cabsync_core_architecture_spec.md#9-professional-git-version-control--release-engineering-protocol) for the full 5-milestone commit roadmap.

---

## License

This project is licensed under the MIT License — see the [LICENSE](./LICENSE) file for details.

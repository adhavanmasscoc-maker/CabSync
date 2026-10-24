# CIT CabSync

> Proprietary campus ride pooling and instant fare-splitting platform engineered exclusively for Chennai Institute of Technology students.

---

## Brand & Proprietary Rights Notice

**CIT CabSync™** is a protected institutional brand and proprietary mobility system. The knapsack luggage allocation algorithm, in-memory ID verification flows, live Firestore transactional matchmaking protocols, and Google Material Design 3 interfaces within this repository represent original intellectual property and brand assets.

> **Restricted Distribution Notice:**  
> Unauthorized recreation, duplication, reverse engineering, redistribution, scraping, cloning, or public deployment of derivative applications or services based on this codebase, brand identity, or UX architecture is strictly restricted and prohibited. All rights reserved.

---

## System Overview

* **Login Screen:** Minimal brand lockup with GDG 4-color bracket logo and Google OAuth gate restricted strictly to `@citchennai.net` institutional accounts.
* **Search Dashboard:** Dynamic terminal selection (Tambaram, Egmore, Kilambakkam, Sriperumbudur), 12-hour AM/PM time picker, luggage point knapsack counters (Trolleys = 2 pts, Backpacks = 1 pt), and female-only pool toggle.
* **Match Lobby:** 2x2 passenger grid with live capacity progress bar, driver fare splitting with pinned GPay QR code, and majority-vote moderation.
* **Ephemeral Chat:** Real-time Firestore chat subcollection with automatic post-ride purge.

---

## Technical Architecture

* **Frontend:** React 18, Vite, Material Design 3 Styling with 60fps micro-animations.
* **Authentication:** Firebase Auth Google Provider restricted to `@citchennai.net`.
* **Database:** Cloud Firestore with real-time listeners and atomic transactions (`runTransaction`).
* **Hosting:** Firebase Hosting.

---

## Proprietary Ownership

Copyright © 2026 CIT CabSync. All rights reserved. Unauthorized reproduction or cloning is prohibited.

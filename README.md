# CIT CabSync

CIT CabSync is a mobile-first Progressive Web App (PWA) to help students share cabs to transit hubs. It solves luggage overflow using a calculated point system and ensures privacy by eliminating phone number exchanges entirely.

---

## Core UI Screens

* **Login Screen:** Hero section with the app tagline and a "Sign in with Google" button restricted to `@citchennai.net` accounts.
* **Search Dashboard:** Form card with destination selection (Tambaram, Egmore, Kilambakkam, Sriperumbudur), time picker, luggage point steppers (Trolleys = 2 pts, Backpacks = 1 pt), and a "Female-Only Pool" toggle.
* **Match Lobby:** 2x2 visual grid displaying matched passenger avatars, names, and extracted batch years, with a horizontal progress bar showing current luggage capacity out of the vehicle's maximum.
* **Temporary Chat Overlay:** Chat window with a pinned image viewer where the trip leader displays their GPay QR code for offline bill splitting.

---

## Features & Implementation

### 1. Authentication (Firebase Auth)
* Google OAuth as the sole login provider.
* Backend restriction blocking any login attempt from an email not ending in `@citchennai.net`.
* Email string parsing upon login to auto-extract student Name, Department, and Batch Year (e.g., "2025" tags 2nd-year student).

### 2. Real-Time Luggage Engine (Firestore)
* Firestore NoSQL collections: `Users`, `Rides`, and `Chat` updated via real-time listeners.
* Firestore Transactions for ride joining to prevent race conditions.
* Strict point limits per vehicle:
  * **Auto:** 4 pts
  * **Sedan:** 7 pts
  * **XL:** 10 pts
* Luggage points: Backpacks = 1 pt, Trolleys = 2 pts.
* If concurrent users join and combined luggage exceeds the vehicle's integer limit, the transaction automatically aborts.

### 3. Ephemeral Chat & Ride Moderation
* Temporary group chat built with Firestore real-time document updates.
* Firebase Cloud Function automatically deletes the chat document exactly 1 hour after the scheduled ride time.
* Pinned image viewer in chat for the trip leader's GPay QR code for offline bill splitting.
* **Vote Out Array:** Stored in the ride document. Requires a majority threshold (e.g., 2 votes in a 4-person cab) to remove a passenger's UID. Voting locks 45 minutes before departure.

### 4. Female-Only Pool & Verification (Google Cloud Vision API)
* Camera capture component to snap a photo of the physical CIT ID.
* Image sent directly to Google Cloud Vision API for ephemeral OCR text extraction.
* Extracted name is compared against the Google Auth name.
* Image is processed in memory and instantly discarded without being saved to Cloud Storage.
* **Pending State Logic:** Generates a unique hash/URL for flagged users requiring authorized confirmation clicks from 3 already-verified female UIDs to update their status.

---

## Tech Stack & Styling

* **Frontend:** PWA built with HTML/JS or lightweight framework, strictly mobile-responsive.
* **Styling:** Google Material Design principles (ample whitespace, 16px border-radius rounded cards, subtle drop shadows, and Google core accent colors: Blue, Red, Yellow, Green).
* **Database & Backend:** Firebase Auth, Cloud Firestore, Firebase Cloud Functions.
* **Hosting:** Firebase Hosting deployed via Firebase CLI.
* **APIs:** Google Cloud Vision API (ephemeral OCR).

---

## Repository Structure

```
cabsync/
├── .gitignore                          # Build and environment ignore rules
├── LICENSE                             # MIT License
├── README.md                           # Project documentation
└── cabsync_core_architecture_spec.md   # Core technical specification
```

---

## License

MIT License

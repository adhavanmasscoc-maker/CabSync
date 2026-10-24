// Developed by aknex
import React, { useState, useEffect } from "react";
import Header from "./components/Header";
import LoginSection from "./components/LoginSection";
import SearchSection from "./components/SearchSection";
import LobbySection from "./components/LobbySection";
import CameraModal from "./components/CameraModal";
import ChatPayModal from "./components/ChatPayModal";
import VoteModal from "./components/VoteModal";
import Toast from "./components/Toast";
import {
  auth,
  googleProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  db,
  doc,
  collection,
  onSnapshot,
  runTransaction,
  setDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
  addDoc
} from "./firebase";

const DOMAIN = "@citchennai.net";
const NOW_YEAR = new Date().getFullYear();

function parseEmail(email) {
  const local = email.split("@")[0];
  const year = (local.match(/(20\d{2})/) || [])[1];
  const dept = (local.match(/[a-z]+(?=\d{4})/i) || [""])[0].toUpperCase() || "CIT";
  const rawName = local.replace(/\d{4}/, "").replace(dept.toLowerCase(), "")
    .split(/[._-]+/).filter(Boolean).map(w => w[0].toUpperCase() + w.slice(1)).join(" ") || "Student";
  const batch = year ? +year : NOW_YEAR;
  return { 
    name: rawName, 
    dept, 
    batch, 
    yr: Math.min(4, Math.max(1, NOW_YEAR - batch + 1)), 
    email 
  };
}

const getInitialDemoRides = (todayStr) => [
  {
    id: "ride-demo-1",
    rideId: "ride-demo-1",
    leaderName: "Prathik R",
    destination: "Tambaram",
    direction: "out",
    departureDate: todayStr,
    departureTime: "4:30 PM",
    vehicleType: "Prime Sedan",
    maxLuggageUnits: 7,
    currentLuggageUnits: 3,
    maxPassengers: 4,
    currentPassengers: 2,
    status: "OPEN",
    isFemaleOnly: false,
    pax: [
      { name: "Prathik R", dept: "ECE", yr: 3, pts: 2, votes: 0, hasMyVote: false },
      { name: "Dinesh K", dept: "IT", yr: 2, pts: 1, votes: 0, hasMyVote: false }
    ]
  },
  {
    id: "ride-demo-2",
    rideId: "ride-demo-2",
    leaderName: "Nisha S",
    destination: "Kilambakkam",
    direction: "out",
    departureDate: todayStr,
    departureTime: "5:15 PM",
    vehicleType: "Auto",
    maxLuggageUnits: 4,
    currentLuggageUnits: 2,
    maxPassengers: 3,
    currentPassengers: 1,
    status: "OPEN",
    isFemaleOnly: false,
    pax: [
      { name: "Nisha S", dept: "CSE", yr: 4, pts: 2, votes: 0, hasMyVote: false }
    ]
  },
  {
    id: "ride-demo-3",
    rideId: "ride-demo-3",
    leaderName: "Sanjay V",
    destination: "Egmore",
    direction: "in",
    departureDate: todayStr,
    departureTime: "6:00 PM",
    vehicleType: "Prime Sedan",
    maxLuggageUnits: 7,
    currentLuggageUnits: 4,
    maxPassengers: 4,
    currentPassengers: 2,
    status: "OPEN",
    isFemaleOnly: false,
    pax: [
      { name: "Sanjay V", dept: "MECH", yr: 3, pts: 2, votes: 0, hasMyVote: false },
      { name: "Harish M", dept: "AIDS", yr: 1, pts: 2, votes: 0, hasMyVote: false }
    ]
  },
  {
    id: "ride-demo-4",
    rideId: "ride-demo-4",
    leaderName: "Kavya P",
    destination: "Sriperumbudur",
    direction: "out",
    departureDate: todayStr,
    departureTime: "7:00 PM",
    vehicleType: "XL",
    maxLuggageUnits: 10,
    currentLuggageUnits: 4,
    maxPassengers: 6,
    currentPassengers: 2,
    status: "OPEN",
    isFemaleOnly: false,
    pax: [
      { name: "Kavya P", dept: "ECE", yr: 2, pts: 2, votes: 0, hasMyVote: false },
      { name: "Rithika N", dept: "CSE", yr: 2, pts: 2, votes: 0, hasMyVote: false }
    ]
  }
];

export default function App() {
  const [activeTab, setActiveTab] = useState("login");
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState("");
  const [toastMsg, setToastMsg] = useState("");

  // Search State
  const todayStr = new Date().toISOString().split("T")[0];
  const [searchState, setSearchState] = useState({
    dir: "out",
    dest: "Tambaram",
    date: todayStr,
    hour: "04",
    minute: "00",
    ampm: "PM",
    trolley: 0,
    backpack: 1,
    femaleOnly: false,
    verified: false
  });
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState("");

  // Lobby & Travel Options State
  const [lobby, setLobby] = useState(null);
  const [allRides, setAllRides] = useState(() => getInitialDemoRides(todayStr));
  const [messages, setMessages] = useState([]);
  const [qrCodeUrl, setQrCodeUrl] = useState("");

  // Modals
  const [camOpen, setCamOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [voteOpen, setVoteOpen] = useState(false);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3500);
  };

  // Auth State Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser && firebaseUser.email) {
        if (firebaseUser.email.endsWith(DOMAIN)) {
          const parsed = parseEmail(firebaseUser.email);
          if (firebaseUser.displayName) parsed.name = firebaseUser.displayName;
          parsed.uid = firebaseUser.uid;
          setUser(parsed);
        } else {
          signOut(auth).catch(() => {});
          setUser(null);
          setAuthError("Blocked: only @citchennai.net Google accounts are allowed.");
        }
      } else {
        setUser(null);
      }
    });
    return () => unsubscribe();
  }, []);

  // Real-time Firestore sync for all other students' rides
  useEffect(() => {
    try {
      const ridesRef = collection(db, "rides");
      const q = query(ridesRef, where("status", "==", "OPEN"));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        if (!snapshot.empty) {
          const liveList = [];
          snapshot.forEach(docSnap => {
            liveList.push({ id: docSnap.id, ...docSnap.data() });
          });
          setAllRides(liveList);
        } else {
          setAllRides(getInitialDemoRides(todayStr));
        }
      }, (err) => {
        console.warn("Firestore rides stream notice:", err);
      });
      return () => unsubscribe();
    } catch (_) {
      setAllRides(getInitialDemoRides(todayStr));
    }
  }, [todayStr]);

  // Google Sign-In via Firebase Auth Popup
  const handleGoogleSignIn = async () => {
    setAuthError("");
    setAuthLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const fbUser = result.user;
      const email = fbUser?.email?.toLowerCase().trim() || "";

      if (!email || !email.endsWith(DOMAIN)) {
        await signOut(auth);
        setAuthError("Blocked: only @citchennai.net Google accounts are allowed.");
        showToast("Access Denied: Not a CIT account ✕");
        return;
      }

      const parsed = parseEmail(email);
      if (fbUser.displayName) parsed.name = fbUser.displayName;
      parsed.uid = fbUser.uid;
      setUser(parsed);

      // Sync user profile to Firestore
      try {
        await setDoc(doc(db, "users", parsed.uid), {
          uid: parsed.uid,
          name: parsed.name,
          email: parsed.email,
          department: parsed.dept,
          batchYear: parsed.batch,
          lastActive: serverTimestamp()
        }, { merge: true });
      } catch (err) {
        console.info("Firestore profile sync notice:", err);
      }

      showToast(`Welcome, ${parsed.name} 👋`);
      setActiveTab("search");
    } catch (err) {
      console.error("Firebase Auth Error:", err);
      if (err.code === "auth/popup-closed-by-user") {
        setAuthError("Sign-in cancelled.");
      } else if (err.code === "auth/unauthorized-domain") {
        setAuthError("Domain not authorized in Firebase Console.");
      } else if (err.code === "auth/operation-not-allowed") {
        setAuthError("Google Sign-In is disabled in Firebase Console.");
      } else {
        setAuthError(err.message || "Failed to sign in with Google.");
      }
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (_) {}
    setUser(null);
    setLobby(null);
    setActiveTab("login");
    showToast("Signed out successfully");
  };

  // Join a specific travel option directly from the Lobby list
  const handleJoinSpecificRide = async (targetRide) => {
    if (!user) {
      showToast("Please sign in with your @citchennai.net account first");
      setActiveTab("login");
      return;
    }

    const myPts = searchState.trolley * 2 + searchState.backpack;
    const currentLug = targetRide.currentLuggageUnits || (targetRide.pax || []).reduce((s, p) => s + (p.pts || 0), 0) || 0;
    const maxLug = targetRide.maxLuggageUnits || 7;
    const currentPax = targetRide.currentPassengers || (targetRide.pax || []).length || 1;
    const maxPax = targetRide.maxPassengers || 4;

    if (currentLug + myPts > maxLug) {
      showToast(`Luggage exceeded! Only ${maxLug - currentLug} pts remaining in vehicle.`);
      return;
    }

    if (currentPax + 1 > maxPax) {
      showToast("This cab pool is already full!");
      return;
    }

    const myPax = {
      uid: user.uid || `cit-${Date.now()}`,
      name: user.name,
      dept: user.dept,
      yr: user.yr,
      pts: myPts,
      me: true,
      votes: 0,
      hasMyVote: false
    };

    const rideId = targetRide.id || targetRide.rideId;
    const isOut = (targetRide.direction || targetRide.dir) === "out";
    const dest = targetRide.destination || targetRide.dest;

    try {
      const rideRef = doc(db, "rides", rideId);
      await runTransaction(db, async (txn) => {
        const snap = await txn.get(rideRef);
        if (snap.exists()) {
          const rData = snap.data();
          const curL = rData.currentLuggageUnits || 0;
          const curP = rData.currentPassengers || 0;
          const maxL = rData.maxLuggageUnits || 7;
          const maxP = rData.maxPassengers || 4;
          if (curL + myPts > maxL) throw new Error("Luggage overflow");
          if (curP + 1 > maxP) throw new Error("Cab full");
          const newPaxList = [...(rData.pax || []), myPax];
          txn.update(rideRef, {
            pax: newPaxList,
            currentLuggageUnits: curL + myPts,
            currentPassengers: curP + 1,
            status: (curP + 1 >= maxP || curL + myPts >= maxL) ? "FULL" : "OPEN",
            updatedAt: serverTimestamp()
          });
        }
      });

      // Subscribe to live ride updates
      onSnapshot(doc(db, "rides", rideId), (snap) => {
        if (snap.exists()) {
          const rData = snap.data();
          setLobby({
            dest: rData.destination,
            dir: rData.direction,
            date: rData.departureDate,
            time: rData.departureTime,
            fem: rData.isFemaleOnly,
            car: { n: rData.vehicleType || "Prime Sedan", max: rData.maxLuggageUnits || 7 },
            rideId,
            pax: (rData.pax || []).map(p => ({
              ...p,
              me: p.uid === user.uid || p.name === user.name
            }))
          });
        }
      });

      // Subscribe to chat
      const msgsRef = collection(db, "rides", rideId, "messages");
      const msgsQ = query(msgsRef, orderBy("createdAt", "asc"));
      onSnapshot(msgsQ, (snap) => {
        const loaded = [];
        snap.forEach(d => {
          const m = d.data();
          loaded.push({
            ...m,
            me: m.senderUid === user.uid || m.senderName === user.name
          });
        });
        setMessages(loaded);
      });
    } catch (err) {
      console.warn("Local fallback join for specific ride:", err);
    }

    // Set active lobby locally
    setLobby({
      dest,
      dir: isOut ? "out" : "in",
      date: targetRide.departureDate || targetRide.date || todayStr,
      time: targetRide.departureTime || targetRide.time || "4:30 PM",
      fem: targetRide.isFemaleOnly || targetRide.fem || false,
      car: { n: targetRide.vehicleType || "Prime Sedan", max: maxLug },
      rideId,
      pax: [...(targetRide.pax || []), myPax]
    });

    showToast(`Joined ${dest} cab pool ✓`);
    setActiveTab("lobby");
  };

  // Find or Create Matching Cab Lobby from Search Form
  const handleFindRides = async () => {
    if (!user) {
      showToast("Please sign in with your @citchennai.net account first");
      setActiveTab("login");
      return;
    }

    const myPts = searchState.trolley * 2 + searchState.backpack;
    if (myPts < 1) {
      setSearchError("Please add at least one luggage bag.");
      return;
    }
    setSearchError("");
    setSearchLoading(true);

    const timeStr = `${parseInt(searchState.hour, 10)}:${searchState.minute} ${searchState.ampm}`;
    const myPax = {
      uid: user.uid || `cit-${Date.now()}`,
      name: user.name,
      dept: user.dept,
      yr: user.yr,
      pts: myPts,
      me: true,
      votes: 0,
      hasMyVote: false
    };

    try {
      const ridesRef = collection(db, "rides");
      const q = query(
        ridesRef,
        where("direction", "==", searchState.dir),
        where("destination", "==", searchState.dest),
        where("status", "==", "OPEN")
      );
      const snapshot = await getDocs(q);
      let matchedDoc = null;

      for (const d of snapshot.docs) {
        const data = d.data();
        const maxLug = data.maxLuggageUnits || 7;
        const maxPax = data.maxPassengers || 4;
        if ((data.currentLuggageUnits || 0) + myPts <= maxLug && (data.currentPassengers || 0) + 1 <= maxPax) {
          matchedDoc = d;
          break;
        }
      }

      let rideId;
      if (matchedDoc) {
        rideId = matchedDoc.id;
        const rideRef = doc(db, "rides", rideId);
        await runTransaction(db, async (txn) => {
          const snap = await txn.get(rideRef);
          if (!snap.exists()) throw new Error("Ride not found");
          const rData = snap.data();
          const curLug = rData.currentLuggageUnits || 0;
          const curP = rData.currentPassengers || 0;
          const maxL = rData.maxLuggageUnits || 7;
          const maxP = rData.maxPassengers || 4;

          if (curLug + myPts > maxL) throw new Error(`Luggage overload. Available: ${maxL - curLug} pts.`);
          if (curP + 1 > maxP) throw new Error("Vehicle is full.");

          const newPax = [...(rData.pax || []), myPax];
          const newLug = curLug + myPts;
          const newP = curP + 1;
          txn.update(rideRef, {
            pax: newPax,
            currentLuggageUnits: newLug,
            currentPassengers: newP,
            status: (newP >= maxP || newLug >= maxL) ? "FULL" : "OPEN",
            updatedAt: serverTimestamp()
          });
        });
      } else {
        const newRef = doc(ridesRef);
        rideId = newRef.id;
        await setDoc(newRef, {
          rideId,
          leaderUid: user.uid,
          leaderName: user.name,
          destination: searchState.dest,
          direction: searchState.dir,
          departureDate: searchState.date,
          departureTime: timeStr,
          vehicleType: "Prime Sedan",
          maxLuggageUnits: 7,
          currentLuggageUnits: myPts,
          maxPassengers: 4,
          currentPassengers: 1,
          status: "OPEN",
          isFemaleOnly: searchState.femaleOnly,
          pax: [myPax],
          createdAt: serverTimestamp()
        });
      }

      // Real-time Ride Document Listener
      onSnapshot(doc(db, "rides", rideId), (snap) => {
        if (snap.exists()) {
          const rData = snap.data();
          setLobby({
            dest: rData.destination,
            dir: rData.direction,
            date: rData.departureDate,
            time: rData.departureTime,
            fem: rData.isFemaleOnly,
            car: { n: rData.vehicleType || "Prime Sedan", max: rData.maxLuggageUnits || 7 },
            rideId,
            pax: (rData.pax || []).map(p => ({
              ...p,
              me: p.uid === user.uid || p.name === user.name
            }))
          });
        }
      });

      // Real-time Chat Messages Listener
      const msgsRef = collection(db, "rides", rideId, "messages");
      const msgsQ = query(msgsRef, orderBy("createdAt", "asc"));
      onSnapshot(msgsQ, (snap) => {
        const loaded = [];
        snap.forEach(d => {
          const m = d.data();
          loaded.push({
            ...m,
            me: m.senderUid === user.uid || m.senderName === user.name
          });
        });
        setMessages(loaded);
      });

      showToast("Joined live Firestore cab lobby ✓");
      setActiveTab("lobby");
    } catch (err) {
      console.warn("Firestore lobby error, using local simulation:", err);
      setLobby({
        dest: searchState.dest,
        dir: searchState.dir,
        date: searchState.date,
        time: timeStr,
        fem: searchState.femaleOnly,
        car: { n: "Prime Sedan", max: 7 },
        pax: [
          { name: "Nisha", dept: "CSE", yr: 3, pts: 2, votes: 0, hasMyVote: false },
          { name: "Kavin", dept: "IT", yr: 1, pts: 1, votes: 0, hasMyVote: false },
          myPax
        ]
      });
      setActiveTab("lobby");
    } finally {
      setSearchLoading(false);
    }
  };

  // Send message in lobby chat
  const handleSendMessage = async (text) => {
    if (!lobby || !user) return;
    if (lobby.rideId) {
      try {
        await addDoc(collection(db, "rides", lobby.rideId, "messages"), {
          senderUid: user.uid,
          senderName: user.name,
          text,
          createdAt: serverTimestamp()
        });
        return;
      } catch (err) {
        console.warn("Message send error:", err);
      }
    }
    setMessages(prev => [...prev, { senderName: user.name, text, me: true }]);
  };

  // Vote Out Moderation
  const handleVotePassenger = (targetId) => {
    if (!lobby) return;
    setLobby(prev => {
      const updatedPax = prev.pax.map(p => {
        if (p.uid === targetId || p.name === targetId) {
          const newVote = !p.hasMyVote;
          const votes = Math.max(0, (p.votes || 0) + (newVote ? 1 : -1));
          return { ...p, votes, hasMyVote: newVote };
        }
        return p;
      }).filter(p => (p.votes || 0) < 2);
      return { ...prev, pax: updatedPax };
    });
    showToast("Vote recorded (Majority = 2 votes to remove)");
  };

  return (
    <>
      <Toast message={toastMsg} />

      {/* Sticky Header with GDG logo & animated sliding pill navigation */}
      <Header 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        user={user} 
        onSignOut={handleSignOut} 
      />

      <main>
        {activeTab === "login" && (
          <LoginSection 
            user={user} 
            onSignIn={handleGoogleSignIn} 
            onSignOut={handleSignOut} 
            onContinueToSearch={() => setActiveTab("search")}
            error={authError}
            loading={authLoading}
          />
        )}

        {activeTab === "search" && (
          <SearchSection 
            searchState={searchState} 
            setSearchState={setSearchState} 
            onFindRides={handleFindRides}
            onOpenCam={() => setCamOpen(true)}
            loading={searchLoading}
            error={searchError}
          />
        )}

        {activeTab === "lobby" && (
          <LobbySection 
            lobby={lobby} 
            onOpenChat={() => setChatOpen(true)}
            onOpenVote={() => setVoteOpen(true)}
            onLeaveLobby={() => {
              setLobby(null);
              showToast("Left cab pool");
            }}
            allRides={allRides}
            onJoinRide={handleJoinSpecificRide}
            myLuggagePts={searchState.trolley * 2 + searchState.backpack}
          />
        )}
      </main>

      {/* Fixed Bottom Offline Group Pay Bar (visible when lobby is active) */}
      {activeTab === "lobby" && lobby && (
        <button 
          className="bottom-pay-bar" 
          onClick={() => setChatOpen(true)}
          type="button"
        >
          <div style={{ width: 38, height: 38, borderRadius: 10, background: "var(--green)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>
            📲
          </div>
          <div>
            <b style={{ fontSize: 14.5, display: "block" }}>Offline Group Pay</b>
            <small style={{ fontSize: 12, opacity: 0.75 }}>Tap to view GPay QR &amp; divide fare</small>
          </div>
        </button>
      )}

      {/* Modals */}
      <CameraModal 
        isOpen={camOpen} 
        onClose={() => setCamOpen(false)} 
        onVerified={() => {
          setSearchState(prev => ({ ...prev, verified: true, femaleOnly: true }));
          showToast("✓ CIT ID verified in RAM memory");
        }} 
      />

      <ChatPayModal 
        isOpen={chatOpen} 
        onClose={() => setChatOpen(false)} 
        lobby={lobby}
        messages={messages}
        onSendMessage={handleSendMessage}
        qrCodeUrl={qrCodeUrl}
        onUploadQr={(e) => {
          const file = e.target.files[0];
          if (file) {
            const reader = new FileReader();
            reader.onload = (evt) => {
              const dataUrl = evt.target.result;
              setQrCodeUrl(dataUrl);
              showToast("Trip QR pinned successfully ✓");
              if (lobby && lobby.rideId) {
                const rideRef = doc(db, "rides", lobby.rideId);
                setDoc(rideRef, { qrCodeDataUrl: dataUrl, qrCodeUploadedBy: user ? user.name : "Student" }, { merge: true })
                  .catch(() => {});
              }
            };
            reader.readAsDataURL(file);
          }
        }}
      />

      <VoteModal 
        isOpen={voteOpen} 
        onClose={() => setVoteOpen(false)} 
        lobby={lobby}
        onVotePassenger={handleVotePassenger}
      />
    </>
  );
}

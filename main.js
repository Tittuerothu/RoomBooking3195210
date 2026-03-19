import {
  auth, db,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  collection, addDoc, getDocs,
  doc, deleteDoc, setDoc,
  query, orderBy, serverTimestamp
} from "./firebase-login.js";

// ── DOM REFS ──────────────────────────────────────────────────────
const authSection    = document.getElementById("auth-section");
const appSection     = document.getElementById("app-section");
const emailInput     = document.getElementById("email");
const passInput      = document.getElementById("password");
const authError      = document.getElementById("auth-error");
const userInfo       = document.getElementById("user-info");
const roomsList      = document.getElementById("rooms-list");
const roomsLoading   = document.getElementById("rooms-loading");
const addRoomMsg     = document.getElementById("add-room-msg");
const bookMsg        = document.getElementById("book-msg");
const allBookingsMsg = document.getElementById("all-bookings-msg");
const roomBookingsMsg= document.getElementById("room-bookings-msg");

let currentUser = null;
let allRooms    = [];   // cache rooms for dropdowns

// ── AUTH STATE ────────────────────────────────────────────────────
onAuthStateChanged(auth, (user) => {
  if (user) {
    currentUser = user;
    authSection.style.display = "none";
    appSection.style.display  = "block";
    userInfo.textContent = user.email;
    loadRooms();
  } else {
    currentUser = null;
    authSection.style.display = "block";
    appSection.style.display  = "none";
    roomsList.innerHTML = "";
    allRooms = [];
  }
});

// ── LOGIN ─────────────────────────────────────────────────────────
document.getElementById("btn-login").addEventListener("click", async () => {
  authError.textContent = "";
  const email    = emailInput.value.trim();
  const password = passInput.value.trim();
  if (!email || !password) { authError.textContent = "Please enter your email and password."; return; }
  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch (err) {
    if (err.code === "auth/invalid-credential")  authError.textContent = "Wrong email or password.";
    else if (err.code === "auth/invalid-email")  authError.textContent = "Please enter a valid email.";
    else authError.textContent = "Login failed: " + err.message;
  }
});

// ── SIGN UP ───────────────────────────────────────────────────────
document.getElementById("btn-signup").addEventListener("click", async () => {
  authError.textContent = "";
  const email    = emailInput.value.trim();
  const password = passInput.value.trim();
  if (!email || !password) { authError.textContent = "Please enter an email and password."; return; }
  try {
    await createUserWithEmailAndPassword(auth, email, password);
  } catch (err) {
    if (err.code === "auth/email-already-in-use") authError.textContent = "Email already registered. Please login.";
    else if (err.code === "auth/weak-password")   authError.textContent = "Password must be at least 6 characters.";
    else authError.textContent = "Sign up failed: " + err.message;
  }
});

// ── LOGOUT ────────────────────────────────────────────────────────
document.getElementById("btn-logout").addEventListener("click", async () => {
  await signOut(auth);
});

// ── LOAD ROOMS (Task 4) ───────────────────────────────────────────
async function loadRooms() {
  roomsLoading.textContent = "Loading rooms...";
  roomsList.innerHTML = "";

  try {
    const q        = query(collection(db, "rooms"), orderBy("createdAt", "asc"));
    const snapshot = await getDocs(q);

    allRooms = [];
    roomsLoading.textContent = "";

    // Clear dropdowns
    const bookSelect   = document.getElementById("book-room-select");
    const filterSelect = document.getElementById("filter-room-select");
    bookSelect.innerHTML   = '<option value="">-- Select a room --</option>';
    filterSelect.innerHTML = '<option value="">-- Select a room --</option>';

    if (snapshot.empty) {
      roomsLoading.textContent = "No rooms yet. Add one above!";
      return;
    }

    snapshot.forEach((docSnap) => {
      const room = { id: docSnap.id, ...docSnap.data() };
      allRooms.push(room);

      // Add to dropdowns
      const opt1 = new Option(room.name, room.id);
      const opt2 = new Option(room.name, room.id);
      bookSelect.appendChild(opt1);
      filterSelect.appendChild(opt2);

      // Room list item
      const li = document.createElement("li");
      li.innerHTML = `
        <div>
          <div class="room-name">${room.name}</div>
          <div class="room-meta">Added by ${room.createdByEmail}</div>
        </div>
        <span class="room-badge">Book</span>
      `;
      li.addEventListener("click", () => {
        // Pre-select this room in the booking form and scroll to it
        bookSelect.value = room.id;
        document.getElementById("book-date").focus();
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
      roomsList.appendChild(li);
    });

  } catch (err) {
    roomsLoading.textContent = "Error loading rooms: " + err.message;
  }
}

// ── ADD ROOM (Task 3) ─────────────────────────────────────────────
document.getElementById("btn-add-room").addEventListener("click", async () => {
  addRoomMsg.style.color = "#333";
  addRoomMsg.textContent = "";
  const roomName = document.getElementById("room-name-input").value.trim();

  if (!roomName) {
    addRoomMsg.style.color = "red";
    addRoomMsg.textContent = "Please enter a room name.";
    return;
  }
  try {
    const snapshot  = await getDocs(collection(db, "rooms"));
    const duplicate = snapshot.docs.some(
      d => d.data().name.toLowerCase() === roomName.toLowerCase()
    );
    if (duplicate) {
      addRoomMsg.style.color = "red";
      addRoomMsg.textContent = "A room with this name already exists.";
      return;
    }
    await addDoc(collection(db, "rooms"), {
      name:           roomName,
      createdBy:      currentUser.uid,
      createdByEmail: currentUser.email,
      createdAt:      serverTimestamp()
    });
    addRoomMsg.style.color = "green";
    addRoomMsg.textContent = `Room "${roomName}" added successfully!`;
    document.getElementById("room-name-input").value = "";
    loadRooms();
  } catch (err) {
    addRoomMsg.style.color = "red";
    addRoomMsg.textContent = "Error: " + err.message;
  }
});

// ── BOOK A ROOM (Task 5) ──────────────────────────────────────────
document.getElementById("btn-book-room").addEventListener("click", async () => {
  bookMsg.style.color = "#333";
  bookMsg.textContent = "";

  const roomId    = document.getElementById("book-room-select").value;
  const date      = document.getElementById("book-date").value;
  const startTime = document.getElementById("book-start").value;
  const endTime   = document.getElementById("book-end").value;
  const title     = document.getElementById("book-title").value.trim();

  // Validation
  if (!roomId || !date || !startTime || !endTime || !title) {
    bookMsg.style.color = "red";
    bookMsg.textContent = "Please fill in all fields.";
    return;
  }
  if (startTime >= endTime) {
    bookMsg.style.color = "red";
    bookMsg.textContent = "End time must be after start time.";
    return;
  }

  try {
    // Task 2: Day document ID is the date string — links room to its days
    const dayRef = doc(db, "rooms", roomId, "days", date);
    await setDoc(dayRef, { date: date }, { merge: true });

    // Check for clashes with existing bookings on this day
    const bookingsRef = collection(db, "rooms", roomId, "days", date, "bookings");
    const existing    = await getDocs(bookingsRef);
    const clash = existing.docs.some(d => {
      const b = d.data();
      // Overlap check: new booking overlaps if it starts before existing ends AND ends after existing starts
      return startTime < b.endTime && endTime > b.startTime;
    });

    if (clash) {
      bookMsg.style.color = "red";
      bookMsg.textContent = "This time slot clashes with an existing booking. Please choose another time.";
      return;
    }

    // Task 2: Booking document inside the day subcollection
    await addDoc(bookingsRef, {
      userId:    currentUser.uid,
      userEmail: currentUser.email,
      title:     title,
      startTime: startTime,
      endTime:   endTime,
      date:      date,
      roomId:    roomId,
      roomName:  allRooms.find(r => r.id === roomId)?.name || "",
      createdAt: serverTimestamp()
    });

    bookMsg.style.color = "green";
    bookMsg.textContent = `Room booked successfully for ${date} from ${startTime} to ${endTime}!`;

    // Clear form
    document.getElementById("book-room-select").value = "";
    document.getElementById("book-date").value        = "";
    document.getElementById("book-start").value       = "";
    document.getElementById("book-end").value         = "";
    document.getElementById("book-title").value       = "";

  } catch (err) {
    bookMsg.style.color = "red";
    bookMsg.textContent = "Error booking room: " + err.message;
  }
});

// ── RENDER BOOKING LIST (shared helper for Task 6, 7, 8) ─────────
function renderBookings(bookings, listEl, msgEl) {
  listEl.innerHTML = "";
  if (bookings.length === 0) {
    msgEl.style.color = "#888";
    msgEl.textContent = "No bookings found.";
    return;
  }
  msgEl.textContent = "";

  // Sort by date then start time
  bookings.sort((a, b) => {
    if (a.date !== b.date) return a.date.localeCompare(b.date);
    return a.startTime.localeCompare(b.startTime);
  });

  bookings.forEach((booking) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <div class="booking-info">
        <div class="booking-title">${booking.title}</div>
        <div class="booking-meta">
          ${booking.roomName} &bull; ${booking.date} &bull; ${booking.startTime} – ${booking.endTime}
        </div>
      </div>
      <button class="btn-delete" data-booking-id="${booking.bookingId}"
        data-room-id="${booking.roomId}" data-date="${booking.date}">Delete</button>
    `;

    // Task 8: Delete button handler
    li.querySelector(".btn-delete").addEventListener("click", async (e) => {
      const bookingId = e.target.dataset.bookingId;
      const roomId    = e.target.dataset.roomId;
      const date      = e.target.dataset.date;
      if (!confirm(`Delete booking "${booking.title}"?`)) return;
      try {
        await deleteDoc(doc(db, "rooms", roomId, "days", date, "bookings", bookingId));
        li.remove();
        // Show empty message if list is now empty
        if (listEl.children.length === 0) {
          msgEl.style.color = "#888";
          msgEl.textContent = "No bookings found.";
        }
      } catch (err) {
        alert("Error deleting booking: " + err.message);
      }
    });

    listEl.appendChild(li);
  });
}

// ── ALL MY BOOKINGS (Task 6) ──────────────────────────────────────
document.getElementById("btn-load-all-bookings").addEventListener("click", async () => {
  allBookingsMsg.style.color = "#888";
  allBookingsMsg.textContent = "Loading...";
  document.getElementById("all-bookings-list").innerHTML = "";

  try {
    const bookings = [];

    // Loop through all rooms, all days, all bookings — filter by current user
    const roomsSnap = await getDocs(collection(db, "rooms"));
    for (const roomDoc of roomsSnap.docs) {
      const daysSnap = await getDocs(collection(db, "rooms", roomDoc.id, "days"));
      for (const dayDoc of daysSnap.docs) {
        const bSnap = await getDocs(
          query(collection(db, "rooms", roomDoc.id, "days", dayDoc.id, "bookings"),
                orderBy("startTime", "asc"))
        );
        bSnap.forEach(bDoc => {
          if (bDoc.data().userId === currentUser.uid) {
            bookings.push({
              bookingId: bDoc.id,
              roomId:    roomDoc.id,
              ...bDoc.data()
            });
          }
        });
      }
    }

    renderBookings(
      bookings,
      document.getElementById("all-bookings-list"),
      allBookingsMsg
    );
  } catch (err) {
    allBookingsMsg.style.color = "red";
    allBookingsMsg.textContent = "Error: " + err.message;
  }
});

// ── MY BOOKINGS FOR A SPECIFIC ROOM (Task 7) ──────────────────────
document.getElementById("btn-load-room-bookings").addEventListener("click", async () => {
  roomBookingsMsg.style.color = "#888";
  roomBookingsMsg.textContent = "Loading...";
  document.getElementById("room-bookings-list").innerHTML = "";

  const roomId = document.getElementById("filter-room-select").value;
  if (!roomId) {
    roomBookingsMsg.style.color = "red";
    roomBookingsMsg.textContent = "Please select a room.";
    return;
  }

  try {
    const bookings  = [];
    const daysSnap  = await getDocs(collection(db, "rooms", roomId, "days"));

    for (const dayDoc of daysSnap.docs) {
      const bSnap = await getDocs(
        query(collection(db, "rooms", roomId, "days", dayDoc.id, "bookings"),
              orderBy("startTime", "asc"))
      );
      bSnap.forEach(bDoc => {
        if (bDoc.data().userId === currentUser.uid) {
          bookings.push({
            bookingId: bDoc.id,
            roomId:    roomId,
            ...bDoc.data()
          });
        }
      });
    }

    renderBookings(
      bookings,
      document.getElementById("room-bookings-list"),
      roomBookingsMsg
    );
  } catch (err) {
    roomBookingsMsg.style.color = "red";
    roomBookingsMsg.textContent = "Error: " + err.message;
  }
});
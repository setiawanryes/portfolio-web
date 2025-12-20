/* =========================================
   FIREBASE GUESTBOOK CONFIGURATION
   ========================================= */

// 1. Import Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
  getFirestore, collection, addDoc, onSnapshot, query, orderBy, serverTimestamp 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { 
  getStorage, ref, uploadBytes, getDownloadURL 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js";

// 2. Konfigurasi Firebase (PUNYAMU)
const firebaseConfig = {
  apiKey: "AIzaSyBGS2_U6M-lC0YozJd0FCHpncyNLE1mE2g",
  authDomain: "portfolio-setiawanryes.firebaseapp.com",
  projectId: "portfolio-setiawanryes",
  storageBucket: "portfolio-setiawanryes.firebasestorage.app",
  messagingSenderId: "171755400027",
  appId: "1:171755400027:web:6bbbbbda56613af0b4087e",
  measurementId: "G-4R3C18RXW0"
};

// 3. Inisialisasi Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

/* =========================================
   DOM ELEMENTS
   ========================================= */
const commentForm = document.getElementById('commentForm');
const commentList = document.getElementById('commentList');
const nameInput = document.getElementById('commentName');
const msgInput = document.getElementById('commentText');
const photoInput = document.getElementById('profilePhoto');
const fileBtnIcon = document.querySelector('.file-btn i'); 

/* =========================================
   LOGIC: HANDLE FILE INPUT (UI)
   ========================================= */
// Ubah warna ikon kamera jika user memilih foto
if (photoInput) {
  photoInput.addEventListener('change', function() {
    if (this.files && this.files[0]) {
      fileBtnIcon.style.color = '#10b981'; // Hijau (sukses)
      fileBtnIcon.className = 'fas fa-check-circle'; 
    }
  });
}

/* =========================================
   LOGIC: KIRIM KOMENTAR
   ========================================= */
if (commentForm) {
  commentForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = nameInput.value.trim();
    const text = msgInput.value.trim();
    const file = photoInput.files[0];

    if (!name || !text) {
      alert("Mohon isi nama dan komentar!");
      return;
    }

    // Loading State
    const submitBtn = commentForm.querySelector('.send-chat-btn');
    const originalIcon = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
    submitBtn.disabled = true;

    try {
      let photoURL = null;

      // 1. Jika ada foto, upload dulu ke Storage
      if (file) {
        const storageRef = ref(storage, `guestbook_photos/${Date.now()}_${file.name}`);
        const snapshot = await uploadBytes(storageRef, file);
        photoURL = await getDownloadURL(snapshot.ref);
      }

      // 2. Simpan data ke Firestore
      await addDoc(collection(db, "guestbook_comments"), {
        name: name,
        text: text,
        photoURL: photoURL,
        timestamp: serverTimestamp()
      });

      // 3. Reset Form
      commentForm.reset();
      fileBtnIcon.style.color = ''; 
      fileBtnIcon.className = 'fas fa-camera'; 

    } catch (error) {
      console.error("Error adding document: ", error);
      alert("Gagal mengirim pesan: " + error.message);
    } finally {
      submitBtn.innerHTML = originalIcon;
      submitBtn.disabled = false;
    }
  });
}

/* =========================================
   LOGIC: TAMPILKAN KOMENTAR (REALTIME)
   ========================================= */
const q = query(collection(db, "guestbook_comments"), orderBy("timestamp", "desc"));

onSnapshot(q, (snapshot) => {
  const commentsHTML = [];

  snapshot.forEach((doc) => {
    const data = doc.data();
    // Format Waktu
    let timeString = 'Baru saja';
    if (data.timestamp) {
        const date = new Date(data.timestamp.seconds * 1000);
        timeString = date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    }
    
    // Avatar Logic
    let avatarImg;
    if (data.photoURL) {
      avatarImg = `<img src="${data.photoURL}" alt="${data.name}" class="comment-avatar">`;
    } else {
      avatarImg = `<img src="https://ui-avatars.com/api/?name=${encodeURIComponent(data.name)}&background=random" alt="${data.name}" class="comment-avatar">`;
    }

    const html = `
      <div class="cmtApp-comment">
        ${avatarImg}
        <div style="flex:1;">
          <div class="cmtApp-comment-header">
            <span class="cmtApp-comment-author" style="font-weight:700; color:#1e293b;">${escapeHtml(data.name)}</span>
            <span class="cmtApp-time" style="font-size:0.7rem; color:#94a3b8; margin-left:auto;">${timeString}</span>
          </div>
          <div class="cmtApp-comment-body" style="font-size:0.9rem; color:#475569; line-height:1.4;">
            ${escapeHtml(data.text)}
          </div>
        </div>
      </div>
    `;
    commentsHTML.push(html);
  });

  if (commentList) {
    if (commentsHTML.length > 0) {
      commentList.innerHTML = commentsHTML.join('');
    } else {
      commentList.innerHTML = `
        <div class="empty-state">
          <i class="far fa-comment-dots"></i>
          <p>No messages yet. Be the first to say hi!</p>
        </div>
      `;
    }
  }
});

// Fungsi Keamanan (Mencegah HTML Injection)
function escapeHtml(text) {
  if (!text) return text;
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
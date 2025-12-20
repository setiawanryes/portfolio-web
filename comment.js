/* =========================================
   FIREBASE COMMENT SYSTEM (DYNAMIC PAGE ID)
   ========================================= */

// 1. Import Library Firebase (Versi Modular)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
  getFirestore, collection, addDoc, onSnapshot, query, orderBy, serverTimestamp 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { 
  getStorage, ref, uploadBytes, getDownloadURL 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js";

// 2. DETEKSI ID HALAMAN (PENTING!)
// Jika di HTML ada <script>window.PAGE_ID = "sitandur";</script>, maka ID-nya "sitandur".
// Jika tidak ada, otomatis jadi "guestbook_main".
const PAGE_ID = window.PAGE_ID || "guestbook_main";
console.log(`💬 System Komentar Aktif untuk: ${PAGE_ID}`);

// 3. Konfigurasi Firebase (Milikmu)
const firebaseConfig = {
  apiKey: "AIzaSyBGS2_U6M-lC0YozJd0FCHpncyNLE1mE2g",
  authDomain: "portfolio-setiawanryes.firebaseapp.com",
  projectId: "portfolio-setiawanryes",
  storageBucket: "portfolio-setiawanryes.firebasestorage.app",
  messagingSenderId: "171755400027",
  appId: "1:171755400027:web:6bbbbbda56613af0b4087e",
  measurementId: "G-4R3C18RXW0"
};

// 4. Inisialisasi Aplikasi
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

// 5. Referensi Database Dinamis
// Data disimpan di: comments -> [NAMA_PROJECT] -> list -> [DATA]
const commentsRef = collection(db, "comments", PAGE_ID, "list");

// 6. Ambil Elemen HTML
const commentForm = document.getElementById('commentForm');
const commentList = document.getElementById('commentList');
const nameInput = document.getElementById('commentName');
const msgInput = document.getElementById('commentText');
const photoInput = document.getElementById('profilePhoto');
const fileBtnIcon = document.querySelector('.file-btn i'); // Ikon kamera

/* =========================================
   LOGIC 1: UI HANDLER (Input File)
   ========================================= */
if (photoInput) {
  photoInput.addEventListener('change', function() {
    if (this.files && this.files[0]) {
      // Ubah ikon jadi centang hijau jika file dipilih
      fileBtnIcon.style.color = '#10b981'; 
      fileBtnIcon.className = 'fas fa-check-circle'; 
    }
  });
}

/* =========================================
   LOGIC 2: KIRIM KOMENTAR
   ========================================= */
if (commentForm) {
  commentForm.addEventListener('submit', async (e) => {
    e.preventDefault(); // Mencegah reload halaman

    const name = nameInput.value.trim();
    const text = msgInput.value.trim();
    const file = photoInput ? photoInput.files[0] : null;

    if (!name || !text) {
      alert("Silakan isi Nama dan Pesan komentar!");
      return;
    }

    // Ubah tombol jadi loading
    const submitBtn = commentForm.querySelector('.send-chat-btn');
    const originalIcon = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>'; 
    submitBtn.disabled = true;

    try {
      let photoURL = null;

      // A. Jika ada foto, Upload ke Storage dulu
      if (file) {
        // Nama file unik: comments_photos/sitandur/170988...jpg
        const storagePath = `comments_photos/${PAGE_ID}/${Date.now()}_${file.name}`;
        const storageRef = ref(storage, storagePath);
        
        const snapshot = await uploadBytes(storageRef, file);
        photoURL = await getDownloadURL(snapshot.ref);
      }

      // B. Simpan data Text + URL Foto ke Firestore
      await addDoc(commentsRef, {
        name: name,
        text: text,
        photoURL: photoURL, // URL foto atau null
        timestamp: serverTimestamp(), // Waktu server
        projectId: PAGE_ID // Penanda tambahan
      });

      // C. Bersihkan Form
      commentForm.reset();
      if(fileBtnIcon) {
        fileBtnIcon.style.color = ''; 
        fileBtnIcon.className = 'fas fa-camera'; 
      }

    } catch (error) {
      console.error("Gagal mengirim:", error);
      alert("Terjadi kesalahan saat mengirim komentar.");
    } finally {
      // Kembalikan tombol seperti semula
      submitBtn.innerHTML = originalIcon;
      submitBtn.disabled = false;
    }
  });
}

/* =========================================
   LOGIC 3: TAMPILKAN KOMENTAR (REALTIME)
   ========================================= */
// Query: Ambil data urut berdasarkan waktu terbaru
const q = query(commentsRef, orderBy("timestamp", "desc"));

onSnapshot(q, (snapshot) => {
  const commentsHTML = [];

  snapshot.forEach((doc) => {
    const data = doc.data();
    
    // Format Waktu (Contoh: 20 Des 2025)
    let timeString = 'Baru saja';
    if (data.timestamp) {
        const date = new Date(data.timestamp.seconds * 1000);
        timeString = date.toLocaleDateString('id-ID', { 
          day: 'numeric', month: 'short', year: 'numeric',
          hour: '2-digit', minute: '2-digit'
        });
    }
    
    // Avatar: Pakai Foto Upload atau Generate Inisial
    let avatarImg;
    if (data.photoURL) {
      avatarImg = `<img src="${data.photoURL}" alt="${data.name}" class="comment-avatar">`;
    } else {
      // Avatar default pakai inisial nama
      avatarImg = `<img src="https://ui-avatars.com/api/?name=${encodeURIComponent(data.name)}&background=random&color=fff&size=128" alt="${data.name}" class="comment-avatar">`;
    }

    // HTML Item Komentar
    const html = `
      <div class="cmtApp-comment">
        ${avatarImg}
        <div style="flex:1;">
          <div class="cmtApp-comment-header">
            <span class="cmtApp-author" style="font-weight:700; color:#1e293b; font-size:0.9rem;">${escapeHtml(data.name)}</span>
            <span class="cmtApp-time" style="font-size:0.7rem; color:#94a3b8; margin-left:auto;">${timeString}</span>
          </div>
          <div class="cmtApp-body" style="font-size:0.9rem; color:#475569; line-height:1.5; margin-top:4px; word-break: break-word;">
            ${escapeHtml(data.text)}
          </div>
        </div>
      </div>
    `;
    commentsHTML.push(html);
  });

  // Render ke Halaman
  if (commentList) {
    if (commentsHTML.length > 0) {
      commentList.innerHTML = commentsHTML.join('');
    } else {
      commentList.innerHTML = `
        <div class="empty-state">
          <i class="far fa-comment-dots"></i>
          <p>Belum ada pesan. Jadilah yang pertama menyapa!</p>
        </div>
      `;
    }
  }
});

// Fungsi Keamanan (Mencegah kode berbahaya/HTML Injection)
function escapeHtml(text) {
  if (!text) return text;
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
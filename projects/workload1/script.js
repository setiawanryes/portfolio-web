AOS.init({ duration: 1000, once: true });

// Pastikan JS ambil elemen yang benar
const slideContainer = document.querySelector('.slide-project');
const slides = slideContainer.querySelectorAll('img');
let index = 0;

function showSlide(i) {
  slideContainer.style.transform = `translateX(-${i * 100}%)`;
}

document.querySelector('.next').addEventListener('click', () => {
  index = (index + 1) % slides.length;
  showSlide(index);
});

document.querySelector('.prev').addEventListener('click', () => {
  index = (index - 1 + slides.length) % slides.length;
  showSlide(index);
});

const modal = document.getElementById("lightboxModal");
const modalImg = document.getElementById("lightboxImg");
const closeBtn = document.getElementsByClassName("close")[0];
const lightboxImages = document.querySelectorAll(".lightbox-img");

let currentIndex = 0;
let scale = 1;

// Open modal saat gambar diklik
lightboxImages.forEach((img, i) => {
  img.addEventListener("click", () => {
    modal.style.display = "flex";
    modalImg.src = img.src;
    currentIndex = i;
    scale = 1;
    modalImg.style.transform = `scale(${scale})`;
  });
});

// Close modal
closeBtn.addEventListener("click", (e) => {
  e.stopPropagation(); 
  modal.style.display = "none";
});

// Klik di luar gambar untuk tutup modal
modal.addEventListener("click", (e) => {
  if (e.target === modal) modal.style.display = "none";
});

// Navigasi prev/next
document.getElementById("prevImg").addEventListener("click", (e) => {
  e.stopPropagation();
  showImage(currentIndex - 1);
});

document.getElementById("nextImg").addEventListener("click", (e) => {
  e.stopPropagation();
  showImage(currentIndex + 1);
});

function showImage(index) {
  currentIndex = (index + lightboxImages.length) % lightboxImages.length;
  modalImg.src = lightboxImages[currentIndex].src;
  scale = 1;
  modalImg.style.transform = `scale(${scale})`;
}

// Zoom scroll
modalImg.addEventListener("wheel", (e) => {
  e.preventDefault();
  if(e.deltaY < 0) scale += 0.1;
  else scale = Math.max(1, scale - 0.1);
  modalImg.style.transform = `scale(${scale})`;
});

// Swipe mobile
let startX = 0;
modalImg.addEventListener("touchstart", e => startX = e.touches[0].clientX);
modalImg.addEventListener("touchend", e => {
  let endX = e.changedTouches[0].clientX;
  if(endX - startX > 50) showImage(currentIndex - 1);
  else if(startX - endX > 50) showImage(currentIndex + 1);
});

const miniModal = document.getElementById("miniModal");
const miniContent = document.getElementById("miniContent");
const stats = document.querySelectorAll(".stat");

stats.forEach(stat => {
  stat.addEventListener("mouseenter", () => {
    const info = stat.getAttribute("data-info");
    miniContent.textContent = info;

    // Tampilkan modal sementara untuk menghitung offsetHeight
    miniModal.style.opacity = 0;
    miniModal.classList.add("show");

    // Gunakan setTimeout 0ms agar browser render modal dulu
    setTimeout(() => {
      const rect = stat.getBoundingClientRect();
      const offset = 10; // jarak modal dari elemen
      const modalHeight = miniModal.offsetHeight;

      // Default posisi di atas
      let topPos = rect.top + window.scrollY - modalHeight - offset;

      // Jika terlalu tinggi, tampilkan di bawah
      if (topPos < window.scrollY) {
        topPos = rect.bottom + window.scrollY + offset;
      }

      // Posisi horizontal
      let leftPos = rect.left + window.scrollX;
      if (leftPos + miniModal.offsetWidth > window.innerWidth) {
        leftPos = window.innerWidth - miniModal.offsetWidth - 10;
      }

      miniModal.style.top = topPos + "px";
      miniModal.style.left = leftPos + "px";

      // Tampilkan modal sepenuhnya
      miniModal.style.opacity = 1;
    }, 0);
  });

  stat.addEventListener("mouseleave", () => {
    miniModal.style.opacity = 0;
    miniModal.classList.remove("show");
  });
});

// Progres Bar
const progressBar = document.getElementById('progress-bar');
const progressText = document.getElementById('progress-text');

function setProgress(percent) {
  progressBar.style.width = percent + '%';
  progressText.textContent = percent + '%';
}

// Contoh: progres 75%
setProgress(15);

/* ===============================
   FITUR KOMENTAR LANJUTAN
   Avatar random otomatis
================================= */
// Import Firebase SDK

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { 
  getFirestore, doc, collection, getDoc, setDoc, addDoc, updateDoc, increment, onSnapshot, query, orderBy 
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBGS2_U6M-lC0YozJd0FCHpncyNLE1mE2g",
  authDomain: "portfolio-setiawanryes.firebaseapp.com",
  projectId: "portfolio-setiawanryes",
  storageBucket: "portfolio-setiawanryes.firebasestorage.app",
  messagingSenderId: "171755400027",
  appId: "1:171755400027:web:6bbbbbda56613af0b4087e",
  measurementId: "G-4R3C18RXW0"
};

// Init Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

let replyTo = null; // komentar yang sedang dibalas

// === DOM Elements ===
const komentarList = document.getElementById("comments-list");
const komentarModal = document.getElementById("cmtAppModal");
const komentarBtn = document.getElementById("komentar-btn");
const closeModalBtn = document.getElementById("close-cmtAppModal");
const kirimBtn = document.getElementById("cmtAppKirim");
const namaInput = document.getElementById("cmtAppNama");
const isiInput = document.getElementById("cmtAppIsi");
const komentarCountSpan = document.getElementById("komentar-count");
const likeBtn = document.getElementById("like-btn");
const likeCount = document.getElementById("like-count");
const likeDocRef = doc(db, "post_reactions", "main"); // Document global untuk like

// ===============================
// Modal Open/Close
// ===============================
komentarBtn.addEventListener("click", () => {
  replyTo = null;
  document.getElementById("cmtAppModalTitle").innerText = "Tulis Komentar";
  komentarModal.classList.add("show");
});
closeModalBtn.addEventListener("click", () => komentarModal.classList.remove("show"));
window.addEventListener("click", e => {
  if (e.target === komentarModal) komentarModal.classList.remove("show");
});

// ===============================
// Fetch & realtime Like Global
// ===============================
// Buat dokumen Like Global jika belum ada
async function initLike() {
  const snap = await getDoc(likeDocRef);
  if(!snap.exists()) {
    await setDoc(likeDocRef, { likes: 0 });
    console.log("Dokumen Like Global dibuat");
  }
}

// Panggil saat halaman dimuat
initLike();

// Realtime listener Like Global
onSnapshot(likeDocRef, docSnap => {
  if(docSnap.exists()) likeCount.textContent = docSnap.data().likes || 0;
});

/// Klik tombol Like Global
likeBtn.addEventListener("click", async () => {
  try {
    await updateDoc(likeDocRef, { likes: increment(1) });
    likeBtn.classList.add("liked");
  } catch (err) {
    console.error("Gagal update like:", err);
  }
});


// ===============================
// Kirim komentar / reply
// ===============================
kirimBtn.addEventListener("click", async () => {
  const nama = namaInput.value.trim();
  const isi = isiInput.value.trim();
  if(!nama || !isi) return alert("Nama dan komentar wajib diisi!");

  const avatar = `https://i.pravatar.cc/50?u=${nama}`;
  const timestamp = Date.now();

  try {
    if(replyTo) {
      // reply ke subcollection 'replies'
      await addDoc(collection(db, "comments", replyTo.dataset.id, "replies"), {
        nama, isi, avatar, timestamp, likes: 0
      });
    } else {
      // komentar utama
      await addDoc(collection(db, "comments"), { nama, isi, avatar, timestamp, likes: 0 });
    }

    namaInput.value = "";
    isiInput.value = "";
    komentarModal.classList.remove("show");
    replyTo = null;

  } catch(err) { console.error("Gagal kirim komentar/reply:", err); }
});

// ===============================
// Render komentar + nested reply
// ===============================
function renderComment(docSnap, container) {
  const data = docSnap.data();
  const id = docSnap.id;

  const div = document.createElement("div");
  div.classList.add("cmtApp-comment");
  div.dataset.id = id;
  div.dataset.replyCount = 0;

  div.innerHTML = `
    <div class="cmtApp-comment-header">
      <img src="${data.avatar}" alt="">
      <strong>${data.nama}</strong>
    </div>
    <div class="cmtApp-comment-body">${data.isi}</div>
    <div class="cmtApp-comment-footer">
      <div class="cmtApp-comment-actions">
        <button class="cmtApp-like">👍 ${data.likes || 0}</button>
        <button class="cmtApp-reply">💬 Balas (0)</button>
      </div>
      <span class="cmtApp-time">${formatWaktu(data.timestamp)}</span>
    </div>
    <div class="cmtApp-replies"></div>
  `;

  container.appendChild(div);

  const repliesContainer = div.querySelector(".cmtApp-replies");
  const replyBtn = div.querySelector(".cmtApp-reply");

  // Like per komentar
  div.querySelector(".cmtApp-like").addEventListener("click", async () => {
    const docRef = doc(db, "comments", id);
    const docSnap = await getDoc(docRef);
    if(!docSnap.exists()) return;
    const newLikes = (docSnap.data().likes || 0) + 1;
    await updateDoc(docRef, { likes: newLikes });
  });

  // Reply
  replyBtn.addEventListener("click", () => {
    replyTo = div;
    document.getElementById("cmtAppModalTitle").innerText = "Balas Komentar";
    komentarModal.classList.add("show");
    isiInput.focus();
  });

  // Fetch nested replies
  const repliesRef = collection(db, "comments", id, "replies");
  const q = query(repliesRef, orderBy("timestamp", "asc"));

  onSnapshot(q, snapshot => {
    repliesContainer.innerHTML = "";
    div.dataset.replyCount = snapshot.size;
    replyBtn.textContent = `💬 Balas (${snapshot.size})`;

    snapshot.forEach(subDoc => renderComment(subDoc, repliesContainer));
    updateTotalComments();
  });
}

// ===============================
// Hitung total komentar + reply
// ===============================
function updateTotalComments() {
  let total = 0;

  const countRecursive = (container) => {
    container.forEach(comment => {
      total++;
      const replies = comment.querySelectorAll(":scope > .cmtApp-replies > .cmtApp-comment");
      if(replies.length > 0) countRecursive(replies);
    });
  };

  const topComments = Array.from(komentarList.querySelectorAll(":scope > .cmtApp-comment"));
  countRecursive(topComments);

  komentarCountSpan.textContent = total;
}

// ===============================
// Fetch komentar utama realtime
// ===============================
const mainQuery = query(collection(db, "comments"), orderBy("timestamp", "desc"));
onSnapshot(mainQuery, snapshot => {
  komentarList.innerHTML = "";
  snapshot.forEach(docSnap => renderComment(docSnap, komentarList));
  updateTotalComments();
});

// ===============================
// Format waktu
// ===============================
function formatWaktu(timestamp) {
  const d = new Date(timestamp), now = new Date();
  const diff = Math.floor((now - d) / 1000);
  if(diff < 60) return "baru saja";
  if(diff < 3600) return `${Math.floor(diff/60)} menit lalu`;
  if(diff < 86400) return `${Math.floor(diff/3600)} jam lalu`;
  if(diff < 604800) return `${Math.floor(diff/86400)} hari lalu`;
  return d.toLocaleDateString();
}
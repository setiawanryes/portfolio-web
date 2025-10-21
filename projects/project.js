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

const likeBtn = document.getElementById('like-btn');
const dislikeBtn = document.getElementById('dislike-btn');
const likeCount = document.getElementById('like-count');
const dislikeCount = document.getElementById('dislike-count');

let likeNumber = 0;
let dislikeNumber = 0;

// Tambah count tiap klik
likeBtn.addEventListener('click', () => {
  likeNumber++;
  likeCount.textContent = likeNumber;
});

/* ===============================
   FITUR KOMENTAR LANJUTAN
   Avatar random otomatis
================================= */
// === Konfigurasi Firebase ===
const firebaseConfig = {
  apiKey: "API_KEY_KAMU",
  authDomain: "komentar-app.firebaseapp.com",
  databaseURL: "https://komentar-app-default-rtdb.firebaseio.com",
  projectId: "komentar-app",
  storageBucket: "komentar-app.appspot.com",
  messagingSenderId: "ISI_PUNYA_MU",
  appId: "ISI_PUNYA_MU"
};

// === Inisialisasi Firebase ===
const app = firebase.initializeApp(firebaseConfig);
const db = firebase.database(app);

// === Ambil elemen DOM ===
const komentarBtn = document.getElementById("komentar-btn");
const komentarModal = document.getElementById("cmtAppModal");
const closeModalBtn = document.getElementById("close-cmtAppModal");
const kirimBtn = document.getElementById("cmtAppKirim");
const namaInput = document.getElementById("cmtAppNama");
const isiInput = document.getElementById("cmtAppIsi");
const komentarList = document.getElementById("comments-list");
const komentarCountSpan = document.getElementById("komentar-count");

let replyTo = null;

// === Buka / Tutup Modal ===
komentarBtn.addEventListener("click", () => {
  replyTo = null;
  document.getElementById("cmtAppModalTitle").innerText = "Tulis Komentar";
  komentarModal.style.display = "flex";
});
closeModalBtn.addEventListener("click", () => komentarModal.style.display = "none");
window.addEventListener("click", e => { if (e.target === komentarModal) komentarModal.style.display = "none"; });

// === Kirim Komentar ===
kirimBtn.addEventListener("click", () => {
  const nama = namaInput.value.trim();
  const isi = isiInput.value.trim();
  if (!nama) return alert("Nama wajib diisi!");

  const avatar = `https://i.pravatar.cc/50?u=${Math.random()}`;
  const waktu = new Date().toISOString();

  const newComment = {
    nama,
    isi: isi || "(Tanpa isi)",
    avatar,
    waktu,
    likes: 0,
    replyTo: replyTo ? replyTo : null
  };

  db.ref("komentar").push(newComment);

  namaInput.value = "";
  isiInput.value = "";
  komentarModal.style.display = "none";
});

// === Render Komentar ===
function tampilkanKomentar(snapshot) {
  komentarList.innerHTML = "";
  const data = snapshot.val();
  if (!data) return;

  const entries = Object.entries(data);
  komentarCountSpan.textContent = entries.length;

  const komentarUtama = entries.filter(([id, c]) => !c.replyTo);
  const balasan = entries.filter(([id, c]) => c.replyTo);

  komentarUtama.reverse().forEach(([id, c]) => {
    const el = buatKomentarEl(id, c);
    komentarList.appendChild(el);

    const repliesContainer = document.createElement("div");
    repliesContainer.classList.add("cmtApp-replies");

    balasan.filter(([rid, rc]) => rc.replyTo === id)
      .forEach(([rid, rc]) => {
        repliesContainer.appendChild(buatKomentarEl(rid, rc));
      });

    if (repliesContainer.childNodes.length > 0) el.appendChild(repliesContainer);
  });
}

function buatKomentarEl(id, c) {
  const div = document.createElement("div");
  div.classList.add("cmtApp-comment");
  div.dataset.id = id;
  div.dataset.likes = c.likes;

  div.innerHTML = `
    <div class="cmtApp-comment-header">
      <img src="${c.avatar}" alt="avatar">
      <strong>${c.nama}</strong>
    </div>
    <div class="cmtApp-comment-body">${c.isi}</div>
    <div class="cmtApp-comment-footer">
      <div class="cmtApp-comment-actions">
        <button class="cmtApp-like">👍 ${c.likes}</button>
        <button class="cmtApp-reply">💬 Balas</button>
      </div>
      <span class="cmtApp-time">${formatWaktu(c.waktu)}</span>
    </div>
  `;
  return div;
}

// === Listener Real-Time ===
db.ref("komentar").on("value", tampilkanKomentar);

// === Like & Reply ===
komentarList.addEventListener("click", e => {
  const target = e.target;
  const comment = target.closest(".cmtApp-comment");
  if (!comment) return;

  const id = comment.dataset.id;

  // Like
  if (target.classList.contains("cmtApp-like")) {
    const likes = parseInt(comment.dataset.likes) + (target.classList.toggle("liked") ? 1 : -1);
    comment.dataset.likes = likes;
    target.textContent = `👍 ${likes}`;
    db.ref(`komentar/${id}/likes`).set(likes);
  }

  // Reply
  if (target.classList.contains("cmtApp-reply")) {
    replyTo = id;
    document.getElementById("cmtAppModalTitle").innerText = "Balas Komentar";
    komentarModal.style.display = "flex";
  }
});

// === Format waktu ===
function formatWaktu(iso) {
  const d = new Date(iso);
  const diff = Math.floor((Date.now() - d) / 1000);
  if (diff < 60) return "baru saja";
  if (diff < 3600) return `${Math.floor(diff / 60)} menit lalu`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} jam lalu`;
  if (diff < 604800) return `${Math.floor(diff / 86400)} hari lalu`;
  return d.toLocaleDateString("id-ID");
}

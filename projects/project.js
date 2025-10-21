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
setProgress(75);

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
(() => {
  let komentarCount = 0;
  let replyTo = null;

  const komentarBtn = document.getElementById("komentar-btn");
  const komentarModal = document.getElementById("cmtAppModal");
  const closeModalBtn = document.getElementById("close-cmtAppModal");
  const kirimBtn = document.getElementById("cmtAppKirim");

  const namaInput = document.getElementById("cmtAppNama");
  const isiInput = document.getElementById("cmtAppIsi");
  const komentarList = document.getElementById("comments-list");
  const komentarCountSpan = document.getElementById("komentar-count");

  // === BUKA MODAL ===
  komentarBtn.addEventListener("click", () => {
    replyTo = null;
    document.getElementById("cmtAppModalTitle").innerText = "Tulis Komentar";
    komentarModal.style.display = "flex";
  });

  // === TUTUP MODAL ===
  closeModalBtn.addEventListener("click", () => komentarModal.style.display = "none");
  window.addEventListener("click", e => { if (e.target === komentarModal) komentarModal.style.display = "none"; });

  // === KIRIM KOMENTAR ===
  kirimBtn.addEventListener("click", () => {
    const nama = namaInput.value.trim();
    const isi = isiInput.value.trim();
    if (!nama) return alert("Nama wajib diisi!");

    // avatar random otomatis
    const avatar = `https://i.pravatar.cc/50?u=${Math.random()}`;

    buatKomentar(nama, isi, avatar);

    // reset form
    namaInput.value = "";
    isiInput.value = "";
    komentarModal.style.display = "none";
  });

  // === BUAT KOMENTAR ===
  function buatKomentar(nama, isi, foto) {
    const comment = document.createElement("div");
    comment.classList.add("cmtApp-comment");

    const waktu = new Date().toISOString();

    comment.innerHTML = `
      <div class="cmtApp-comment-header">
        <img src="${foto}" alt="avatar"/>
        <strong>${nama}</strong>
      </div>
      <div class="cmtApp-comment-body">${isi || "(Tanpa isi)"}</div>
      <div class="cmtApp-comment-footer">
        <div class="cmtApp-comment-actions">
          <button class="cmtApp-like">👍 0</button>
          <button class="cmtApp-reply">💬 Balas (0)</button>
        </div>
        <span class="cmtApp-time" data-time="${waktu}">${formatWaktu(waktu)}</span>
      </div>
    `;

    comment.dataset.time = waktu;
    comment.dataset.likes = 0;
    comment.dataset.replies = 0;

    comment.style.opacity = 0;
    comment.style.transform = "translateY(20px)";
    setTimeout(() => {
      comment.style.transition = "all 0.3s ease";
      comment.style.opacity = 1;
      comment.style.transform = "translateY(0)";
    }, 10);

    // handle reply
    if (replyTo) {
      const repliesContainer = replyTo.querySelector(".cmtApp-replies") || (() => {
        const div = document.createElement("div");
        div.classList.add("cmtApp-replies");
        replyTo.appendChild(div);
        return div;
      })();
      repliesContainer.appendChild(comment);

      replyTo.dataset.replies = parseInt(replyTo.dataset.replies) + 1;
      const replyBtn = replyTo.querySelector(".cmtApp-reply");
      replyBtn.textContent = `💬 Balas (${replyTo.dataset.replies})`;

      replyTo = null;
    } else {
      komentarList.appendChild(comment);
      komentarCount++;
      komentarCountSpan.textContent = komentarCount;
    }
  }

  // === LIKE & REPLY EVENTS ===
  komentarList.addEventListener("click", (e) => {
    const target = e.target;
    const comment = target.closest(".cmtApp-comment");

    if (target.classList.contains("cmtApp-like")) {
      let likes = parseInt(comment.dataset.likes);
      if (target.classList.toggle("liked")) likes++;
      else likes--;
      comment.dataset.likes = likes;
      target.textContent = `👍 ${likes}`;
    }

    if (target.classList.contains("cmtApp-reply")) {
      replyTo = comment;
      document.getElementById("cmtAppModalTitle").innerText = "Balas Komentar";
      komentarModal.style.display = "flex";
    }
  });

  // === FORMAT WAKTU RELATIF ===
  function formatWaktu(iso) {
    const d = new Date(iso);
    const now = new Date();
    const diff = Math.floor((now - d) / 1000);

    if (diff < 60) return "baru saja";
    if (diff < 3600) return `${Math.floor(diff / 60)} menit yang lalu`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} jam yang lalu`;
    if (diff < 604800) return `${Math.floor(diff / 86400)} hari yang lalu`;
    return d.toLocaleDateString();
  }

  // update waktu relatif tiap menit
  setInterval(() => {
    document.querySelectorAll(".cmtApp-time").forEach(el => {
      el.textContent = formatWaktu(el.dataset.time);
    });
  }, 60000);
})();

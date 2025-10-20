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

dislikeBtn.addEventListener('click', () => {
  dislikeNumber++;
  dislikeCount.textContent = dislikeNumber;
});



// ===============================
// KOMENTAR APP (AMAN & TERPISAH)
// ===============================

// Variabel global
let likeCount = 0;
let komentarCount = 0;
let replyToCmt = null;
const defaultAvatarCmt = "images/default-avatar.png"; // pastikan ada gambar default di folder images

// Tombol Like utama
const likeBtn = document.getElementById("like-btn");
const likeCountSpan = document.getElementById("like-count");
if (likeBtn && likeCountSpan) {
  likeBtn.addEventListener("click", () => {
    likeCount++;
    likeCountSpan.innerText = likeCount;
  });
}

// Tombol buka modal komentar
const komentarBtn = document.getElementById("komentar-btn");
if (komentarBtn) {
  komentarBtn.addEventListener("click", () => {
    replyToCmt = null;
    document.getElementById("cmtAppModalTitle").innerText = "Tulis Komentar";
    document.getElementById("cmtAppModal").style.display = "flex";
  });
}

// Tutup modal
const closeModal = document.getElementById("close-cmtAppModal");
if (closeModal) {
  closeModal.addEventListener("click", () => {
    document.getElementById("cmtAppModal").style.display = "none";
  });
}

// Tombol kirim komentar
const kirimBtn = document.getElementById("cmtAppKirim");
if (kirimBtn) {
  kirimBtn.addEventListener("click", () => {
    const nama = document.getElementById("cmtAppNama").value.trim();
    const isi = document.getElementById("cmtAppIsi").value.trim();
    const fotoInput = document.getElementById("cmtAppFoto");

    if (!nama) return alert("Nama wajib diisi!");

    if (fotoInput.files.length > 0) {
      const reader = new FileReader();
      reader.onload = function () {
        buatKomentarCmt(nama, isi, reader.result);
      };
      reader.readAsDataURL(fotoInput.files[0]);
    } else {
      buatKomentarCmt(nama, isi, defaultAvatarCmt);
    }

    // reset & tutup modal
    document.getElementById("cmtAppModal").style.display = "none";
    document.getElementById("cmtAppNama").value = "";
    document.getElementById("cmtAppFoto").value = "";
    document.getElementById("cmtAppIsi").value = "";
  });
}

// Fungsi buat komentar baru
function buatKomentarCmt(nama, isi, foto) {
  const commentDiv = document.createElement("div");
  commentDiv.classList.add("cmtApp-comment");

  commentDiv.innerHTML = `
    <div class="cmtApp-comment-header">
      <img src="${foto}" alt="avatar">
      <strong>${nama}</strong>
    </div>
    <div class="cmtApp-comment-body">${isi || "(Tanpa isi)"}</div>
    <div class="cmtApp-comment-actions">
      <button class="cmtApp-like-komentar">Suka</button>
      <button class="cmtApp-balas-komentar">Balas</button>
    </div>
  `;

  if (replyToCmt) {
    replyToCmt.appendChild(commentDiv);
    replyToCmt = null;
  } else {
    document.getElementById("comments-list").appendChild(commentDiv);
    komentarCount++;
    document.getElementById("komentar-count").innerText = komentarCount;
  }
}

// Event delegation untuk Like & Balas komentar
document.addEventListener("click", (e) => {
  if (e.target.classList.contains("cmtApp-like-komentar")) {
    e.target.innerText =
      e.target.innerText === "Suka" ? "❤️ Disukai" : "Suka";
  }

  if (e.target.classList.contains("cmtApp-balas-komentar")) {
    replyToCmt = e.target.closest(".cmtApp-comment");
    document.getElementById("cmtAppModalTitle").innerText = "Balas Komentar";
    document.getElementById("cmtAppModal").style.display = "flex";
  }
});

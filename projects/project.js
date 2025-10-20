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


// Daftar teks role
const roles = [
  "Administrasi HR",
  "Staff Admin",
  "Analyst Data",
  "Welcome Web Developer"
];

let index = 0;
const roleContainer = document.getElementById("role-text");

function changeRole() {
  // Animasi keluar
  roleContainer.style.animation = "slideOut 0.6s ease forwards";

  setTimeout(() => {
    // Ganti teks setelah animasi keluar
    index = (index + 1) % roles.length;
    roleContainer.textContent = roles[index];

    // Animasi masuk
    roleContainer.style.animation = "slideIn 0.6s ease forwards";
  }, 600);
}

// Ganti teks setiap 3 detik
setInterval(changeRole, 3000);

async function postComment(e) {
  e.preventDefault();
  const name = document.getElementById("name").value.trim();
  const comment = document.getElementById("comment").value.trim();

  if (!name || !comment) {
    alert("Tolong isi nama dan komentar dulu ya.");
    return;
  }

  const res = await fetch("/.netlify/functions/comment", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title: name, body: comment }),
  });

  if (res.ok) {
    alert("Komentar terkirim! Tunggu sebentar untuk muncul di bawah.");
    document.getElementById("commentForm").reset();
    loadComments();
  } else {
    alert("Gagal mengirim komentar 😥");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const page = document.querySelector(".page-transition");
  setTimeout(() => document.body.classList.add("loaded"), 100); // efek masuk

  const backLinks = document.querySelectorAll(".back-btn");
  backLinks.forEach(link => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const target = e.currentTarget.getAttribute("href");

      // Tambahkan efek fade-out lembut
      page.classList.add("fade-out");

      // Sedikit delay supaya transisi terlihat lembut
      setTimeout(() => {
        window.location.href = target;
      }, 900); // harus sedikit lebih lama dari CSS transition
    });
  });
});



// === About Tabs ===
const aboutTabs = document.querySelectorAll('.about-tabs .tab');
const aboutContents = document.querySelectorAll('.about-content .tab-content');

aboutTabs.forEach(tab => {
  tab.addEventListener('click', () => {
    // Remove active class dari semua tab dan konten
    aboutTabs.forEach(t => t.classList.remove('active'));
    aboutContents.forEach(c => c.classList.remove('active'));

    // Tambahkan active ke tab yang diklik dan kontennya
    tab.classList.add('active');
    const target = document.getElementById(tab.dataset.tab);
    target.classList.add('active');
  });
});

// === Portfolio Tabs ===
const portfolioTabs = document.querySelectorAll('.portfolio-tabs .tab-btn');
const portfolioContents = document.querySelectorAll('.portfolio-section .tab-content');

portfolioTabs.forEach(tab => {
  tab.addEventListener('click', () => {
    // Remove active class dari semua tab dan konten
    portfolioTabs.forEach(t => t.classList.remove('active'));
    portfolioContents.forEach(c => c.classList.remove('active'));

    // Tambahkan active ke tab yang diklik dan kontennya
    tab.classList.add('active');
    const target = document.getElementById(tab.dataset.tab);
    target.classList.add('active');
  });
});

//===Slider
const track = document.querySelector('.slider-track');
const slides = Array.from(track.children);
const nextBtn = document.querySelector('.next');
const prevBtn = document.querySelector('.prev');

let currentIndex = 0;

// Tandai slide aktif
function setActiveSlide(index) {
  slides.forEach(slide => slide.classList.remove('active'));
  slides[index].classList.add('active');
}

// Geser track
function moveToSlide(index) {
  const slideWidth = slides[0].getBoundingClientRect().width + 20; // +gap
  track.style.transform = `translateX(-${slideWidth * index}px)`;
  setActiveSlide(index);
}

// Tombol Next
nextBtn.addEventListener('click', () => {
  currentIndex = (currentIndex + 1) % slides.length;
  moveToSlide(currentIndex);
});

// Tombol Prev
prevBtn.addEventListener('click', () => {
  currentIndex = (currentIndex - 1 + slides.length) % slides.length;
  moveToSlide(currentIndex);
});

// Auto play
setInterval(() => {
  currentIndex = (currentIndex + 1) % slides.length;
  moveToSlide(currentIndex);
}, 3000);

// Klik langsung di slide untuk float effect
slides.forEach((slide, index) => {
  slide.addEventListener('click', () => {
    currentIndex = index;
    moveToSlide(currentIndex);
  });
});

// Inisialisasi
moveToSlide(0);


// JS untuk menandai bintang sesuai progress
document.querySelectorAll('.project-progress-stars').forEach(stars => {
  const completed = parseInt(stars.dataset.completed || '0', 10);
  const starEls = stars.querySelectorAll('i');
  starEls.forEach((star, index) => {
    if (index < completed) star.classList.add('completed');
    else star.classList.remove('completed');
  });
});


// Modal script
const modal = document.getElementById("skill-modal");
const modalContent = document.getElementById("skill-detail");
const closeBtn = document.querySelector(".modal .close");

document.querySelectorAll(".skill-trigger").forEach(trigger => {
  trigger.addEventListener("click", () => {
    modalContent.innerHTML = trigger.getAttribute("data-skill");
    modal.style.display = "block";
  });
});

closeBtn.addEventListener("click", () => modal.style.display = "none");
window.addEventListener("click", e => {
  if (e.target === modal) modal.style.display = "none";
});

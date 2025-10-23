// === Role Text Animation ===
const roles = ["Administrasi HR", "Staff Admin", "Analyst Data", "Welcome Web Developer"];
let roleIndex = 0;
const roleContainer = document.getElementById("role-text");

function changeRole() {
  roleContainer.style.animation = "slideOut 0.6s ease forwards";
  setTimeout(() => {
    roleIndex = (roleIndex + 1) % roles.length;
    roleContainer.textContent = roles[roleIndex];
    roleContainer.style.animation = "slideIn 0.6s ease forwards";
  }, 600);
}
setInterval(changeRole, 3000);

// === Page transition & back buttons ===
document.addEventListener("DOMContentLoaded", () => {
  const page = document.querySelector(".page-transition");
  setTimeout(() => document.body.classList.add("loaded"), 100);

  document.querySelectorAll(".back-btn").forEach(link => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const target = link.getAttribute("href");
      page.classList.add("fade-out");
      setTimeout(() => window.location.href = target, 900);
    });
  });
});

// === Tabs ===
function setupTabs(tabSelector, contentSelector) {
  const tabs = document.querySelectorAll(tabSelector);
  const contents = document.querySelectorAll(contentSelector);
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      contents.forEach(c => c.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById(tab.dataset.tab).classList.add('active');
    });
  });
}
setupTabs('.about-tabs .tab', '.about-content .tab-content');
setupTabs('.portfolio-tabs .tab-btn', '.portfolio-section .tab-content');

// === Project stars ===
document.querySelectorAll('.project-progress-stars').forEach(stars => {
  const completed = parseInt(stars.dataset.completed || '0', 10);
  stars.querySelectorAll('i').forEach((star, i) => {
    star.classList.toggle('completed', i < completed);
  });
});

// === Modal Skill Trigger ===
const modal = document.getElementById("skill-modal");
const modalContent = document.getElementById("skill-detail");
const closeBtn = document.querySelector(".modal .close");

document.querySelectorAll(".skill-trigger").forEach(trigger => {
  trigger.addEventListener("click", () => {
    modalContent.innerHTML = trigger.dataset.skill;
    modal.style.display = "block";
  });
});
closeBtn.addEventListener("click", () => modal.style.display = "none");
window.addEventListener("click", e => {
  if (e.target === modal) modal.style.display = "none";
});


const sliderMain = document.querySelector('.experience-slider-main');
const prevBtn = document.getElementById('prev-card');
const nextBtn = document.getElementById('next-card');
let index = 0;

function showSlide() {
  const cardWidth = sliderMain.children[0].offsetWidth;
  const gap = 20; // sama dengan CSS
  sliderMain.style.transform = `translateX(-${index * (cardWidth + gap)}px)`;
}

prevBtn.addEventListener('click', () => {
  index = (index > 0) ? index - 1 : sliderMain.children.length - 1;
  showSlide();
});

nextBtn.addEventListener('click', () => {
  index = (index < sliderMain.children.length - 1) ? index + 1 : 0;
  showSlide();
});

// inisialisasi
showSlide();

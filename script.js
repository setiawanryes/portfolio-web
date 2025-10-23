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

// === Slider per card (foto) ===
document.querySelectorAll('.experience-slider').forEach(slider => {
  const track = slider.querySelector('.slider-track');
  const prev = slider.querySelector('.prev');
  const next = slider.querySelector('.next');
  let pos = 0;
  const slideWidth = 150 + 5; // width + gap

  prev.addEventListener('click', () => {
    pos = Math.min(pos + slideWidth, 0);
    track.style.transform = `translateX(${pos}px)`;
  });

  next.addEventListener('click', () => {
    pos = Math.max(pos - slideWidth, -(track.scrollWidth - slideWidth));
    track.style.transform = `translateX(${pos}px)`;
  });
});

// === Slider utama (experience-slider-main) ===
const sliderMain = document.querySelector('.experience-slider-main');
const mainPrevBtn = document.getElementById('prev-card');
const mainNextBtn = document.getElementById('next-card');
let mainIndex = 0;

function showSlide() {
  sliderMain.style.transform = `translateX(-${mainIndex * 100}%)`;
}

mainPrevBtn.addEventListener('click', () => {
  mainIndex = (mainIndex > 0) ? mainIndex - 1 : sliderMain.children.length - 1;
  showSlide();
});

mainNextBtn.addEventListener('click', () => {
  mainIndex = (mainIndex < sliderMain.children.length - 1) ? mainIndex + 1 : 0;
  showSlide();
});

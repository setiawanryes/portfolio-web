// === SLIDER UTAMA (Geser antar card) ===
const track = document.getElementById("experienceTrack");
const nextBtn = document.getElementById("next-card");
const prevBtn = document.getElementById("prev-card");

let currentIndex = 0;

function updateSlider() {
  const cardWidth = 400; // termasuk gap
  track.style.transform = `translateX(-${currentIndex * cardWidth}px)`;
}

nextBtn.addEventListener("click", () => {
  const total = track.children.length;
  if (currentIndex < total - 1) currentIndex++;
  updateSlider();
});

prevBtn.addEventListener("click", () => {
  if (currentIndex > 0) currentIndex--;
  updateSlider();
});

// === SLIDER DALAM CARD (Gambar per pengalaman) ===
document.querySelectorAll(".experience-slider").forEach(slider => {
  const track = slider.querySelector(".slider-track");
  const images = slider.querySelectorAll("img");
  const next = slider.querySelector(".next");
  const prev = slider.querySelector(".prev");

  if (!next || !prev) return;

  let index = 0;

  function update() {
    const width = 150;
    track.style.transform = `translateX(-${index * width}px)`;
  }

  next.addEventListener("click", () => {
    if (index < images.length - 1) index++;
    update();
  });

  prev.addEventListener("click", () => {
    if (index > 0) index--;
    update();
  });
});

// === SLIDER UTAMA (Geser antar card) ===

const track = document.getElementById("experienceTrack");
const nextBtn = document.getElementById("next-card");
const prevBtn = document.getElementById("prev-card");

// 1. Cek Awal: Pastikan elemen track dan tombol utama ditemukan di HTML
if (track && nextBtn && prevBtn) {

    let currentIndex = 0;
    
    // **PENTING:** Ambil semua kartu dengan class '.exp-item'
    const cards = track.querySelectorAll('.exp-item'); 
    
    if (cards.length === 0) {
        console.warn("experienceTrack tidak memiliki kartu (.exp-item). Pastikan class 'exp-item' sudah benar di HTML Anda.");
        // Nonaktifkan tombol jika tidak ada kartu untuk digeser
        nextBtn.disabled = true;
        prevBtn.disabled = true;
        return; 
    }

    function updateSlider() {
        
        // Hitung lebar kartu pertama secara akurat (termasuk padding dan border)
        const cardWidth = cards[0].offsetWidth; 
        
        // Ambil nilai gap dari CSS Anda (berdasarkan CSS yang Anda kirim: 20px)
        const cssGap = 20;
        
        // Total jarak geser: Lebar Kartu + Gap
        const slideDistance = cardWidth + cssGap; 

        // Terapkan pergeseran
        track.style.transform = `translateX(-${currentIndex * slideDistance}px)`;
        
        // Kontrol Tombol (nonaktif saat di ujung)
        prevBtn.disabled = currentIndex === 0;
        nextBtn.disabled = currentIndex === cards.length - 1;
    }

    // Panggil sekali untuk mengatur posisi awal dan status tombol
    updateSlider();

    nextBtn.addEventListener("click", () => {
        if (currentIndex < cards.length - 1) {
            currentIndex++;
            updateSlider();
        }
    });

    prevBtn.addEventListener("click", () => {
        if (currentIndex > 0) {
            currentIndex--;
            updateSlider();
        }
    });

} else {
    console.error("Kesalahan ID: experienceTrack, next-card, atau prev-card tidak ditemukan di HTML.");
}


// -------------------------------------------------------------
// === SLIDER DALAM CARD (Gambar per pengalaman) ===
// -------------------------------------------------------------

document.querySelectorAll(".experience-slider").forEach(slider => {
    const track = slider.querySelector(".slider-track");
    const images = slider.querySelectorAll("img");
    const next = slider.querySelector(".next");
    const prev = slider.querySelector(".prev");

    // Pastikan tombol slider internal ditemukan
    if (!next || !prev || !track) return; 

    let index = 0;

    function update() {
        const width = 150; // Lebar gambar (sesuai setting Anda)
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
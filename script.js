// =========================================================
// 1. GLOBAL & INISIALISASI (Berjalan segera)
// =========================================================

// === Role Text Animation ===
// Pastikan variabel 'roles' hanya dideklarasikan SATU KALI.
const roles = ["Administrasi HR", "Staff Admin", "Analyst Data", "Welcome Web Developer"];
let roleIndex = 0;
const roleContainer = document.getElementById("role-text");

function changeRole() {
    // Cek keberadaan elemen sebelum manipulasi
    if (!roleContainer) return; 
    roleContainer.style.animation = "slideOut 0.6s ease forwards";
    setTimeout(() => {
        roleIndex = (roleIndex + 1) % roles.length;
        roleContainer.textContent = roles[roleIndex];
        roleContainer.style.animation = "slideIn 0.6s ease forwards";
    }, 600);
}
// Jalankan interval hanya jika elemen ditemukan
if (roleContainer) {
    setInterval(changeRole, 3000);
}

// === AOS Initialization ===
// Pastikan library AOS sudah terpasang
// AOS.init({ duration: 1000, once: true });


// =========================================================
// 2. DOMContentLoaded (Berjalan setelah HTML dimuat)
// =========================================================

document.addEventListener("DOMContentLoaded", () => {
    
    // --- 2.1 Page Transition & Back Buttons ---
    const page = document.querySelector(".page-transition");
    setTimeout(() => document.body.classList.add("loaded"), 100);

    document.querySelectorAll(".back-btn").forEach(link => {
        link.addEventListener("click", (e) => {
            e.preventDefault();
            const target = link.getAttribute("href");
            if (page) {
                page.classList.add("fade-out");
                setTimeout(() => window.location.href = target, 900);
            } else {
                 window.location.href = target;
            }
        });
    });

    // --- 2.2 LOGIKA SLIDER UTAMA (Perbaikan Final) ---
    const sliderMain = document.querySelector('.experience-slider-main');
    const prevBtn = document.getElementById('prev-card');
    const nextBtn = document.getElementById('next-card');
    let sliderIndex = 0; // Mengganti 'index' menjadi 'sliderIndex' untuk menghindari konflik

    if (sliderMain && prevBtn && nextBtn) {
        
        const cards = sliderMain.querySelectorAll('.exp-item');
        const totalCards = cards.length;
        const gap = 20; 

        if (totalCards === 0) {
            console.warn("Slider Utama: Tidak ada kartu .exp-item ditemukan.");
            prevBtn.disabled = true;
            nextBtn.disabled = true;
            return;
        }

        function showSlide() {
            // Ambil lebar kartu pertama secara dinamis dan aman
            const cardWidth = cards[0].offsetWidth;
            const slideDistance = cardWidth + gap; 
            
            sliderMain.style.transform = `translateX(-${sliderIndex * slideDistance}px)`;
            
            // Atur status tombol (nonaktif di ujung)
            prevBtn.disabled = sliderIndex === 0;
            nextBtn.disabled = sliderIndex === totalCards - 1;
        }
        
        // Event Listeners
        prevBtn.addEventListener('click', () => {
            if (sliderIndex > 0) {
                sliderIndex--;
                showSlide();
            }
        });

        nextBtn.addEventListener('click', () => {
            if (sliderIndex < totalCards - 1) {
                sliderIndex++;
                showSlide();
            }
        });

        // Inisialisasi: Atur posisi awal
        showSlide(); 

    } else {
        console.error("Slider Utama Gagal: Elemen experienceTrack/tombol tidak ditemukan. Cek ID.");
    }
    
    // --- 2.3 Tabs ---
    function setupTabs(tabSelector, contentSelector) {
        const tabs = document.querySelectorAll(tabSelector);
        const contents = document.querySelectorAll(contentSelector);
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                tabs.forEach(t => t.classList.remove('active'));
                contents.forEach(c => c.classList.remove('active'));
                tab.classList.add('active');
                
                const targetContent = document.getElementById(tab.dataset.tab);
                if (targetContent) {
                    targetContent.classList.add('active');
                }
            });
        });
    }
    setupTabs('.about-tabs .tab', '.about-content .tab-content');
    setupTabs('.portfolio-tabs .tab-btn', '.portfolio-section .tab-content');

    // --- 2.4 Project stars ---
    document.querySelectorAll('.project-progress-stars').forEach(stars => {
        const completed = parseInt(stars.dataset.completed || '0', 10);
        stars.querySelectorAll('i').forEach((star, i) => {
            star.classList.toggle('completed', i < completed);
        });
    });

    // --- 2.5 Modal Skill Trigger ---
    const modal = document.getElementById("skill-modal");
    const modalContent = document.getElementById("skill-detail");
    const closeBtn = document.querySelector(".modal .close");

    if (modal && modalContent && closeBtn) {
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
    }
    
    // --- 2.6 Slider Dalam Card (Di sini jika elemennya ada di dalam DOM) ---
    document.querySelectorAll(".experience-slider").forEach(slider => {
        const track = slider.querySelector(".slider-track");
        const images = slider.querySelectorAll("img");
        const next = slider.querySelector(".next");
        const prev = slider.querySelector(".prev");

        if (!next || !prev || !track) return; 

        let index = 0;

        function update() {
            const width = 150; // Lebar gambar
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

}); // Akhir DOMContentLoaded


// =========================================================
// 3. FUNGSI GLOBAL (Tidak perlu menunggu DOM)
// =========================================================

function togglePopup(popupId) {
    const popup = document.getElementById(popupId);
    const allPopups = document.querySelectorAll('.mini-popup');
    const isAlreadyOpen = popup.classList.contains('active');

    allPopups.forEach(p => p.classList.remove('active'));

    if (popup && !isAlreadyOpen) {
        popup.classList.add('active');
    }
}

// Menutup popup jika klik di sembarang tempat
window.onclick = function (event) {
    // Menutup jika klik BUKAN pada tombol '.bt' dan BUKAN di dalam wadah tombol
    if (!event.target.matches('.bt') && !event.target.closest('.button-wrapper')) { 
        const allPopups = document.querySelectorAll('.mini-popup');
        allPopups.forEach(p => p.classList.remove('active'));
    }
}
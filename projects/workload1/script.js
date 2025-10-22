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
setProgress(100);

/* ===============================
   FITUR KOMENTAR LANJUTAN
   Avatar random otomatis
================================= */
// Import Firebase SDK


import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import {
  getFirestore, doc, collection, getDoc, setDoc, updateDoc, increment,
  addDoc, onSnapshot, query, orderBy, serverTimestamp, getDocs, deleteDoc,
  limit, startAfter
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBGS2_U6M-lC0YozJd0FCHpncyNLE1mE2g",
  authDomain: "portfolio-setiawanryes.firebaseapp.com",
  projectId: "portfolio-setiawanryes",
  storageBucket: "portfolio-setiawanryes.firebasestorage.app",
  messagingSenderId: "171755400027",
  appId: "1:171755400027:web:6bbbbbda56613af0b4087e",
  measurementId: "G-4R3C18RXW0"
};

// ===============================
// 🔥 Firebase Init
// ===============================
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/* ------------- PAGE ID (unik per halaman) -------------
   Bisa ditetapkan lewat window.PAGE_ID, meta tag, atau fallback ke URL filename.
*/
const pageId = window.PAGE_ID
  || document.querySelector('meta[name="workload"]')?.content
  || (location.pathname.split('/').filter(Boolean).pop() || 'main');

/* ------------- SETTINGS ------------- */
const pageLikeDoc = doc(db, 'post_reactions', pageId);
const commentsCollection = collection(db, 'comments', pageId, 'list');

const pageSize = 6; // komentar per load (awal)
let lastVisible = null; // untuk pagination
let isLoadingMore = false;

/* ------------- DOM elements (guarded) ------------- */
const komentarList = document.getElementById('comments-list');
const komentarModal = document.getElementById('cmtAppModal');
const komentarBtn = document.getElementById('komentar-btn');
const closeModalBtn = document.getElementById('close-cmtAppModal');
const kirimBtn = document.getElementById('cmtAppKirim');
const namaInput = document.getElementById('cmtAppNama');
const isiInput = document.getElementById('cmtAppIsi');
const komentarCountSpan = document.getElementById('komentar-count');
const likeBtn = document.getElementById('like-btn');
const likeCount = document.getElementById('like-count');

const sortingSelect = document.getElementById('comment-sorting'); // optional select element
const loadMoreBtn = document.getElementById('load-more-comments'); // optional button for load more
const notifyBadge = document.getElementById('comment-notify-badge'); // optional realtime badge
const themeToggle = document.getElementById('comment-theme-toggle'); // optional theme toggle

/* ------------- small guards if elements missing ------------- */
function el(id) { return document.getElementById(id); }
function safeAddEvent(elm, ev, cb) { if (elm) elm.addEventListener(ev, cb); }

/* ------------- Utilities ------------- */
function escapeHtml(s='') {
  return String(s).replaceAll('&', '&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;')
    .replaceAll('"','&quot;').replaceAll("'",'&#039;');
}
function formatWaktu(ts) {
  const d = new Date(ts), now = new Date();
  const diff = Math.floor((now - d) / 1000);
  if (diff < 60) return "baru saja";
  if (diff < 3600) return `${Math.floor(diff/60)} menit lalu`;
  if (diff < 86400) return `${Math.floor(diff/3600)} jam lalu`;
  if (diff < 604800) return `${Math.floor(diff/86400)} hari lalu`;
  return d.toLocaleDateString();
}

/* ------------- Page Like System ------------- */
async function ensurePageLikeDoc() {
  const s = await getDoc(pageLikeDoc);
  if (!s.exists()) {
    await setDoc(pageLikeDoc, { likes: 0 });
  }
}
async function initPageLike() {
  try {
    await ensurePageLikeDoc();
    // realtime update
    onSnapshot(pageLikeDoc, snap => {
      if (!snap.exists()) return;
      if (likeCount) likeCount.textContent = snap.data().likes || 0;
    });
    safeAddEvent(likeBtn, 'click', async () => {
      try {
        await updateDoc(pageLikeDoc, { likes: increment(1) });
        if (likeBtn) likeBtn.classList.add('liked');
      } catch(e) { console.error('like page err', e); }
    });
  } catch(e) { console.error('initPageLike err', e); }
}
initPageLike();

/* ------------- Comment rendering helpers ------------- */
function canLikeCommentLocal(commentId) {
  try {
    return !localStorage.getItem(`${pageId}-liked-cmt-${commentId}`);
  } catch { return true; }
}
function markLikedLocal(commentId) {
  try { localStorage.setItem(`${pageId}-liked-cmt-${commentId}`, '1'); } catch {}
}
function unmarkLikedLocal(commentId) {
  try { localStorage.removeItem(`${pageId}-liked-cmt-${commentId}`); } catch {}
}

/* Render a comment doc -> container element.
   This handles: like per comment, reply button, edit, delete, and replies realtime.
*/
function renderComment(docSnap, container) {
  const data = docSnap.data();
  const id = docSnap.id;
  const created = data.timestamp || Date.now();

  const div = document.createElement('div');
  div.className = 'cmtApp-comment';
  div.dataset.id = id;
  div.innerHTML = `
    <div class="cmtApp-comment-header">
      <img src="${escapeHtml(data.avatar || `https://i.pravatar.cc/50?u=${encodeURIComponent(data.nama||'anon')}`)}" alt="">
      <strong>${escapeHtml(data.nama || 'Anonymous')}</strong>
    </div>
    <div class="cmtApp-comment-body">${escapeHtml(data.isi || data.message || '')}</div>
    <div class="cmtApp-comment-footer">
      <div class="cmtApp-comment-actions">
        <button class="cmtApp-like">${canLikeCommentLocal(id) ? '👍' : '💖'} ${data.likes || 0}</button>
        <button class="cmtApp-reply">💬 Balas (0)</button>
        <button class="cmtApp-edit">✏️ Edit</button>
        <button class="cmtApp-delete">🗑️ Hapus</button>
      </div>
      <span class="cmtApp-time">${formatWaktu(created)}</span>
    </div>
    <div class="cmtApp-replies"></div>
  `;

  container.appendChild(div);

  // bind actions
  const likeBtnLocal = div.querySelector('.cmtApp-like');
  const replyBtn = div.querySelector('.cmtApp-reply');
  const editBtn = div.querySelector('.cmtApp-edit');
  const deleteBtn = div.querySelector('.cmtApp-delete');
  const repliesContainer = div.querySelector('.cmtApp-replies');

  // Like per comment (1x via localStorage)
  if (likeBtnLocal) {
    likeBtnLocal.addEventListener('click', async () => {
      try {
        if (!canLikeCommentLocal(id)) {
          // optional: toggle unlike? we keep single like only
          alert('Kamu sudah memberi like untuk komentar ini.');
          return;
        }
        const docRef = doc(db, 'comments', pageId, 'list', id);
        await updateDoc(docRef, { likes: increment(1) });
        markLikedLocal(id);
        // update UI quickly
        const current = parseInt(likeBtnLocal.textContent.replace(/\D/g,'')) || 0;
        likeBtnLocal.textContent = `💖 ${current+1}`;
      } catch(e) { console.error('like comment err', e); }
    });
  }

  // Reply - open modal and set replyTo
  if (replyBtn) {
    replyBtn.addEventListener('click', () => {
      // set global replyTo element & open modal
      window.CMT_REPLY_TO = { id, el: div };
      if (document.getElementById('cmtAppModalTitle'))
        document.getElementById('cmtAppModalTitle').innerText = `Balas ke ${data.nama}`;
      if (komentarModal) komentarModal.classList.add('show');
      if (isiInput) isiInput.focus();
    });
  }

  // Edit - confirm name then edit content inline via modal
  if (editBtn) {
    editBtn.addEventListener('click', async () => {
      try {
        const confirmName = prompt('Konfirmasi edit: ketik nama pemilik komentar:');
        if (!confirmName) return;
        if (confirmName.trim() !== (data.nama || '').trim()) {
          alert('Nama tidak cocok. Edit dibatalkan.');
          return;
        }
        // prompt edit content
        const newText = prompt('Ubah komentar:', data.isi || '');
        if (newText === null) return; // cancel
        const docRef = doc(db, 'comments', pageId, 'list', id);
        await updateDoc(docRef, { isi: newText });
        // UI akan update via realtime listener
      } catch(e) { console.error('edit err', e); }
    });
  }

  // Delete - confirm name then delete replies + doc
  if (deleteBtn) {
    deleteBtn.addEventListener('click', async () => {
      try {
        const confirmName = prompt('Konfirmasi hapus: ketik nama pemilik komentar:');
        if (!confirmName) return;
        if (confirmName.trim() !== (data.nama || '').trim()) {
          alert('Nama tidak cocok. Hapus dibatalkan.');
          return;
        }
        // delete replies first
        const repliesRef = collection(db, 'comments', pageId, 'list', id, 'replies');
        const repliesSnap = await getDocs(repliesRef);
        for (const r of repliesSnap.docs) {
          await deleteDoc(doc(db, 'comments', pageId, 'list', id, 'replies', r.id));
        }
        // delete main comment
        await deleteDoc(doc(db, 'comments', pageId, 'list', id));
        // remove local marker if any
        unmarkLikedLocal(id);
        // UI remove handled by realtime listener
      } catch(e) { console.error('delete err', e); alert('Gagal menghapus. Cek console.'); }
    });
  }

  // Realtime replies
  try {
    const repliesRefRealtime = collection(db, 'comments', pageId, 'list', id, 'replies');
    const q = query(repliesRefRealtime, orderBy('timestamp','asc'));
    onSnapshot(q, snap => {
      repliesContainer.innerHTML = '';
      replyBtn.textContent = `💬 Balas (${snap.size})`;
      snap.forEach(subDoc => renderComment(subDoc, repliesContainer));
    });
  } catch(e) { console.error('replies realtime err', e); }
}

/* ------------- Comments list management ------------- */
let currentSort = 'newest'; // newest | oldest | popular

function buildQueryForInitial() {
  if (currentSort === 'popular') {
    // popular: order by likes desc then timestamp desc
    return query(commentsCollection, orderBy('likes','desc'), orderBy('timestamp','desc'), limit(pageSize));
  } else if (currentSort === 'oldest') {
    return query(commentsCollection, orderBy('timestamp','asc'), limit(pageSize));
  } else { // newest
    return query(commentsCollection, orderBy('timestamp','desc'), limit(pageSize));
  }
}

/* initial realtime listener for first page (keeps UI realtime for newest pageSize)
   For pagination we will fetch older docs by getDocs(startAfter)
*/
let unsubscribeInitial = null;
function subscribeInitialComments() {
  if (!komentarList) return;
  if (unsubscribeInitial) unsubscribeInitial();

  const q = buildQueryForInitial();
  unsubscribeInitial = onSnapshot(q, snap => {
    // realtime notify (new comments)
    if (notifyBadge) {
      const prevCount = parseInt(notifyBadge.dataset.count || '0', 10);
      const newCount = snap.size;
      if (newCount > prevCount) {
        notifyBadge.style.display = 'inline-block';
        notifyBadge.textContent = newCount - prevCount;
      } else {
        notifyBadge.style.display = 'none';
      }
      notifyBadge.dataset.count = newCount;
    }

    komentarList.innerHTML = '';
    snap.forEach(docSnap => renderComment(docSnap, komentarList));
    // set lastVisible for pagination
    const docs = snap.docs;
    lastVisible = docs.length ? docs[docs.length-1] : null;
    updateCommentCountUI();
  }, err => console.error('initial comments onSnapshot err', err));
}
subscribeInitialComments();

/* Load more older comments (non-realtime fetch) */
async function loadMoreComments() {
  if (isLoadingMore) return;
  if (!lastVisible) {
    // no more
    if (loadMoreBtn) loadMoreBtn.style.display = 'none';
    return;
  }
  isLoadingMore = true;
  try {
    // build base query for older docs depending on sort
    let q;
    if (currentSort === 'oldest') {
      // when sorting oldest (asc), load next docs after lastVisible by timestamp asc
      q = query(commentsCollection, orderBy('timestamp','asc'), startAfter(lastVisible), limit(pageSize));
    } else if (currentSort === 'popular') {
      q = query(commentsCollection, orderBy('likes','desc'), orderBy('timestamp','desc'), startAfter(lastVisible), limit(pageSize));
    } else {
      // newest: load older by timestamp desc startAfter lastVisible
      q = query(commentsCollection, orderBy('timestamp','desc'), startAfter(lastVisible), limit(pageSize));
    }

    const snap = await getDocs(q);
    if (snap.empty) {
      if (loadMoreBtn) loadMoreBtn.style.display = 'none';
      lastVisible = null;
    } else {
      snap.forEach(docSnap => renderComment(docSnap, komentarList));
      const docs = snap.docs;
      lastVisible = docs[docs.length-1];
    }
  } catch(e) { console.error('loadMore err', e); }
  isLoadingMore = false;
}

/* ------------- Send comment / reply ------------- */
safeAddEvent(kirimBtn, 'click', async () => {
  try {
    const nama = (namaInput?.value || '').trim();
    const isi = (isiInput?.value || '').trim();
    if (!nama || !isi) return alert('Nama dan komentar wajib diisi!');

    const avatar = `https://i.pravatar.cc/50?u=${encodeURIComponent(nama)}`;
    const ts = Date.now();

    // reply?
    const replyTo = window.CMT_REPLY_TO || null;
    if (replyTo && replyTo.id) {
      // add to replies subcollection
      await addDoc(collection(db, 'comments', pageId, 'list', replyTo.id, 'replies'), {
        nama, isi, avatar, likes: 0, timestamp: ts
      });
      // reset replyTo
      window.CMT_REPLY_TO = null;
    } else {
      // add top-level comment
      await addDoc(commentsCollection, {
        nama, isi, avatar, likes: 0, timestamp: ts
      });
    }

    // reset modal fields + close
    if (namaInput) namaInput.value = '';
    if (isiInput) isiInput.value = '';
    if (komentarModal) komentarModal.classList.remove('show');

    // optionally scroll to top of comment list for newest sort
    if (currentSort === 'newest' && komentarList) {
      komentarList.scrollTo({ top: 0, behavior: 'smooth' });
    }
  } catch(e) { console.error('kirim err', e); alert('Gagal kirim komentar'); }
});

/* ------------- Sorting & UI helpers ------------- */
function updateCommentCountUI() {
  if (!komentarCountSpan || !komentarList) return;
  const total = komentarList.querySelectorAll('.cmtApp-comment').length;
  komentarCountSpan.textContent = total;
}

safeAddEvent(sortingSelect, 'change', () => {
  currentSort = sortingSelect.value || 'newest';
  // re-subscribe initial comments with new sort
  subscribeInitialComments();
  // reset pagination state
  lastVisible = null;
  if (loadMoreBtn) loadMoreBtn.style.display = 'inline-block';
});

safeAddEvent(loadMoreBtn, 'click', () => loadMoreComments());

/* realtime badge clear when user opens comments or modal */
safeAddEvent(komentarBtn, 'click', () => {
  if (notifyBadge) { notifyBadge.style.display = 'none'; notifyBadge.dataset.count = '0'; }
});

/* theme toggle: just toggle a class on komentarList (or project-container)
   you should implement CSS for .comment-dark / .comment-light in CSS
*/
safeAddEvent(themeToggle, 'click', () => {
  const container = document.querySelector('.project-container') || komentarList;
  if (!container) return;
  container.classList.toggle('comment-dark'); // toggle class for styling
  container.classList.toggle('comment-light');
});

/* initialize UI states */
if (loadMoreBtn) loadMoreBtn.style.display = 'inline-block';
if (notifyBadge) { notifyBadge.style.display = 'none'; notifyBadge.dataset.count = '0'; }
if (sortingSelect && sortingSelect.value) currentSort = sortingSelect.value;

/* safety: if komentarList missing, don't run comment subscriptions */
if (!kometarListExists()) {
  console.warn('Komponen komentar tidak ditemukan pada halaman ini — fitur komentar tidak aktif.');
}

/* helper to check */
function kometarListExists() {
  return !!komentarList;
}

/* If komentarList exists, ensure initial subscription (already called above) */
if (kometarListExists()) {
  subscribeInitialComments();
}
/* ===============================
   🪟 Modal Komentar: Buka & Tutup
================================ */
safeAddEvent(komentarBtn, 'click', () => {
  if (komentarModal) {
    komentarModal.classList.add('show');
    if (isiInput) isiInput.focus();
  }
});

safeAddEvent(closeModalBtn, 'click', () => {
  if (komentarModal) komentarModal.classList.remove('show');
  window.CMT_REPLY_TO = null; // reset jika sempat balas
});

/* Tutup modal dengan klik di luar konten */
window.addEventListener('click', (e) => {
  if (e.target === komentarModal) {
    komentarModal.classList.remove('show');
    window.CMT_REPLY_TO = null;
  }
});

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

// ----- PAGE ID UNIK -----
const pageId = window.PAGE_ID
  || document.querySelector('meta[name="workload"]')?.content
  || (location.pathname.split('/').filter(Boolean).pop() || 'main');

// ----- FIRESTORE REFERENCES -----
const pageLikeDoc = doc(db, 'post_reactions', pageId);
const commentsCollection = collection(db, 'comments', pageId, 'list');

// ----- SETTINGS -----
const pageSize = 3;
let lastVisible = null;
let isLoadingMore = false;
let currentSort = 'newest';

// ----- DOM ELEMENTS -----
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
const sortingSelect = document.getElementById('comment-sorting');
const loadMoreBtn = document.getElementById('load-more-comments');
const notifyBadge = document.getElementById('comment-notify-badge');

// helper untuk event aman
function safeAddEvent(el, ev, cb) { if (el) el.addEventListener(ev, cb); }

// ----- UTILITIES -----
function escapeHtml(s = '') {
  return String(s)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function formatWaktu(ts) {
  if (!ts) return '';
  const d = new Date(ts), now = new Date();
  const diff = Math.floor((now - d) / 1000);
  if (diff < 60) return "baru saja";
  if (diff < 3600) return `${Math.floor(diff / 60)} menit lalu`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} jam lalu`;
  if (diff < 604800) return `${Math.floor(diff / 86400)} hari lalu`;
  return d.toLocaleDateString();
}

// local like tracking per komentar
function canLikeCommentLocal(commentId) {
  try { return !localStorage.getItem(`${pageId}-liked-cmt-${commentId}`); } catch { return true; }
}
function markLikedLocal(commentId) {
  try { localStorage.setItem(`${pageId}-liked-cmt-${commentId}`, '1'); } catch {}
}
function unmarkLikedLocal(commentId) {
  try { localStorage.removeItem(`${pageId}-liked-cmt-${commentId}`); } catch {}
}

// ----- PAGE LIKE -----
async function ensurePageLikeDoc() {
  const s = await getDoc(pageLikeDoc);
  if (!s.exists()) await setDoc(pageLikeDoc, { likes: 0 });
}

async function initPageLike() {
  try {
    await ensurePageLikeDoc();
    onSnapshot(pageLikeDoc, snap => {
      if (!snap.exists()) return;
      if (likeCount) likeCount.textContent = snap.data().likes || 0;
    });
    safeAddEvent(likeBtn, 'click', async () => {
      try {
        await updateDoc(pageLikeDoc, { likes: increment(1) });
        if (likeBtn) likeBtn.classList.add('liked');
      } catch (e) { console.error('initPageLike click err', e); }
    });
  } catch (e) { console.error('initPageLike err', e); }
}
initPageLike();

// ----- RENDER KOMENTAR -----
function renderComment(docSnap, container, parentId = null) {
  const data = docSnap.data ? docSnap.data() : {};
  const id = docSnap.id || (docSnap._id || Math.random().toString(36).slice(2));
  const created = data.timestamp || Date.now();

  const div = document.createElement('div');
  div.className = 'cmtApp-comment';
  div.dataset.id = id;
  div.dataset.parentId = parentId || '';
  div.innerHTML = `
    <div class="cmtApp-comment-header">
      <img src="${escapeHtml(data.avatar || `https://i.pravatar.cc/50?u=${encodeURIComponent(data.nama || 'anon')}`)}" alt="">
      <strong>${escapeHtml(data.nama || 'Anonymous')}</strong>
    </div>
    <div class="cmtApp-comment-body">${escapeHtml(data.isi || data.message || '')}</div>
    <div class="cmtApp-comment-footer">
      <div class="cmtApp-comment-actions">
        <button class="cmtApp-like">${canLikeCommentLocal(id) ? '👍' : '💖'} ${data.likes || 0}</button>
        <button class="cmtApp-reply">💬 Reply (0)</button>
        <button class="cmtApp-edit">✏️ Edit</button>
        <button class="cmtApp-delete">🗑️ Delete</button>
      </div>
      <span class="cmtApp-time">${formatWaktu(created)}</span>
    </div>
    <div class="cmtApp-replies"></div>
  `;

  container.appendChild(div);

  const likeBtnLocal = div.querySelector('.cmtApp-like');
  const replyBtn = div.querySelector('.cmtApp-reply');
  const editBtn = div.querySelector('.cmtApp-edit');
  const deleteBtn = div.querySelector('.cmtApp-delete');
  const repliesContainer = div.querySelector('.cmtApp-replies');

  // LIKE
  if (likeBtnLocal) {
    likeBtnLocal.addEventListener('click', async () => {
      try {
        if (!canLikeCommentLocal(id)) { alert('You have already liked this comment'); return; }
        const docRef = parentId
          ? doc(db, 'comments', pageId, 'list', parentId, 'replies', id)
          : doc(db, 'comments', pageId, 'list', id);
        await updateDoc(docRef, { likes: increment(1) });
        markLikedLocal(id);
        const current = parseInt(likeBtnLocal.textContent.replace(/\D/g, '')) || 0;
        likeBtnLocal.textContent = `💖 ${current + 1}`;
      } catch (e) { console.error('like comment err', e); }
    });
  }

  // REPLY
  if (replyBtn) {
    replyBtn.addEventListener('click', () => {
      window.CMT_REPLY_TO = { id, el: div };
      if (document.getElementById('cmtAppModalTitle'))
        document.getElementById('cmtAppModalTitle').innerText = `Balas ke ${data.nama}`;
      if (komentarModal) komentarModal.classList.add('show');
      if (isiInput) isiInput.focus();
    });
  }

  // EDIT
  if (editBtn) {
    editBtn.addEventListener('click', async () => {
      try {
        const confirmName = prompt('Type your name in the comment:');
        if (!confirmName) return;
        if (confirmName.trim() !== (data.nama || '').trim()) {
          alert('Name mismatch. Please try again.');
          return;
        }
        const newText = prompt('Edit comment:', data.isi || '');
        if (newText === null) return;

        const docRef = parentId
          ? doc(db, 'comments', pageId, 'list', parentId, 'replies', id)
          : doc(db, 'comments', pageId, 'list', id);
        await updateDoc(docRef, { isi: newText });
      } catch (e) { console.error('edit err', e); }
    });
  }

  // DELETE
  if (deleteBtn) {
    deleteBtn.addEventListener('click', async () => {
      try {
        const confirmName = prompt('Type your name in the comment');
        if (!confirmName) return;
        if (confirmName.trim() !== (data.nama || '').trim()) {
          alert('Name mismatch. Please try again.');
          return;
        }

        const docRef = parentId
          ? doc(db, 'comments', pageId, 'list', parentId, 'replies', id)
          : doc(db, 'comments', pageId, 'list', id);

        // hapus semua reply jika komentar utama
        if (!parentId) {
          const repliesRef = collection(db, 'comments', pageId, 'list', id, 'replies');
          const repliesSnap = await getDocs(repliesRef);
          for (const r of repliesSnap.docs) {
            await deleteDoc(doc(db, 'comments', pageId, 'list', id, 'replies', r.id));
          }
        }

        await deleteDoc(docRef);
        unmarkLikedLocal(id);
      } catch (e) { console.error('delete err', e); alert('Gagal menghapus. Lihat console.'); }
    });
  }

  // REALTIME REPLIES
  try {
    const repliesRefRealtime = collection(db, 'comments', pageId, 'list', id, 'replies');
    const q = query(repliesRefRealtime, orderBy('timestamp', 'asc'));
    onSnapshot(q, snap => {
      repliesContainer.innerHTML = '';
      replyBtn.textContent = `💬 Balas (${snap.size})`;
      snap.forEach(subDoc => renderComment(subDoc, repliesContainer, id)); // penting: pass parentId
      updateCommentCountUI();
    });
  } catch (e) { console.error('replies realtime err', e); }

  updateCommentCountUI();
}

// ----- QUERY BUILDER -----
function buildQueryForInitial() {
  if (currentSort === 'popular') {
    return query(commentsCollection, orderBy('likes', 'desc'), orderBy('timestamp', 'desc'), limit(pageSize));
  } else if (currentSort === 'oldest') {
    return query(commentsCollection, orderBy('timestamp', 'asc'), limit(pageSize));
  } else {
    return query(commentsCollection, orderBy('timestamp', 'desc'), limit(pageSize));
  }
}

// ----- SUBSCRIBE INITIAL -----
let unsubscribeInitial = null;
function subscribeInitialComments() {
  if (!komentarList) return;
  if (unsubscribeInitial) unsubscribeInitial();

  const q = buildQueryForInitial();
  unsubscribeInitial = onSnapshot(q, snap => {
    if (notifyBadge) {
      const prev = parseInt(notifyBadge.dataset.count || '0', 10);
      const nowCount = snap.size;
      if (nowCount > prev) {
        notifyBadge.style.display = 'inline-block';
        notifyBadge.textContent = nowCount - prev;
      } else {
        notifyBadge.style.display = 'none';
      }
      notifyBadge.dataset.count = nowCount;
    }

    komentarList.innerHTML = '';
    snap.forEach(docSnap => renderComment(docSnap, komentarList));
    const docs = snap.docs;
    lastVisible = docs.length ? docs[docs.length - 1] : null;
    updateCommentCountUI();
  }, err => console.error('initial comments onSnapshot err', err));
}
subscribeInitialComments();

// ----- LOAD MORE -----
async function loadMoreComments() {
  if (isLoadingMore) return;
  if (!lastVisible) { if (loadMoreBtn) loadMoreBtn.style.display = 'none'; return; }
  isLoadingMore = true;
  try {
    let q;
    if (currentSort === 'oldest') {
      q = query(commentsCollection, orderBy('timestamp', 'asc'), startAfter(lastVisible), limit(pageSize));
    } else if (currentSort === 'popular') {
      q = query(commentsCollection, orderBy('likes', 'desc'), orderBy('timestamp', 'desc'), startAfter(lastVisible), limit(pageSize));
    } else {
      q = query(commentsCollection, orderBy('timestamp', 'desc'), startAfter(lastVisible), limit(pageSize));
    }
    const snap = await getDocs(q);
    if (snap.empty) { if (loadMoreBtn) loadMoreBtn.style.display = 'none'; lastVisible = null; }
    else {
      snap.forEach(docSnap => renderComment(docSnap, komentarList));
      const docs = snap.docs;
      lastVisible = docs[docs.length - 1];
    }
  } catch (e) { console.error('loadMore err', e); }
  isLoadingMore = false;
}

// ----- KIRIM KOMENTAR / REPLY -----
safeAddEvent(kirimBtn, 'click', async () => {
  try {
    const nama = (namaInput?.value || '').trim();
    const isi = (isiInput?.value || '').trim();
    if (!nama || !isi) return alert('Nama dan komentar wajib diisi!');

    const avatar = `https://i.pravatar.cc/50?u=${encodeURIComponent(nama)}`;
    const ts = Date.now();
    const replyTo = window.CMT_REPLY_TO || null;

    if (replyTo && replyTo.id) {
      await addDoc(collection(db, 'comments', pageId, 'list', replyTo.id, 'replies'), {
        nama, isi, avatar, likes: 0, timestamp: ts
      });
      window.CMT_REPLY_TO = null;
    } else {
      await addDoc(commentsCollection, { nama, isi, avatar, likes: 0, timestamp: ts });
    }

    if (namaInput) namaInput.value = '';
    if (isiInput) isiInput.value = '';
    if (komentarModal) komentarModal.classList.remove('show');

    if (currentSort === 'newest' && komentarList) komentarList.scrollTo({ top: 0, behavior: 'smooth' });
  } catch (e) { console.error('kirim err', e); alert('Gagal kirim komentar'); }
});

// ----- COUNTER -----
function updateCommentCountUI() {
  if (!komentarCountSpan) return;
  const mainComments = document.querySelectorAll('#comments-list > .cmtApp-comment').length;
  const replies = document.querySelectorAll('#comments-list .cmtApp-replies .cmtApp-comment').length;
  const total = mainComments + replies;
  komentarCountSpan.textContent = total;
  komentarCountSpan.classList.add('pop');
  setTimeout(() => komentarCountSpan.classList.remove('pop'), 220);
}

// ----- UI HANDLERS -----
safeAddEvent(sortingSelect, 'change', () => {
  currentSort = sortingSelect.value || 'newest';
  lastVisible = null;
  if (loadMoreBtn) loadMoreBtn.style.display = 'inline-block';
  subscribeInitialComments();
});
safeAddEvent(loadMoreBtn, 'click', loadMoreComments);
safeAddEvent(komentarBtn, 'click', () => {
  if (komentarModal) { komentarModal.classList.add('show'); isiInput?.focus(); }
  if (notifyBadge) { notifyBadge.style.display = 'none'; notifyBadge.dataset.count = '0'; }
});
safeAddEvent(closeModalBtn, 'click', () => {
  if (komentarModal) komentarModal.classList.remove('show');
  window.CMT_REPLY_TO = null;
});
window.addEventListener('click', e => {
  if (e.target === komentarModal) {
    komentarModal.classList.remove('show');
    window.CMT_REPLY_TO = null;
  }
});

// init UI
if (loadMoreBtn) loadMoreBtn.style.display = 'inline-block';
if (notifyBadge) { notifyBadge.style.display = 'none'; notifyBadge.dataset.count = '0'; }
if (sortingSelect && sortingSelect.value) currentSort = sortingSelect.value;

// safety check
if (!komentarList) console.warn('Komponen komentar tidak ditemukan — fitur komentar non-aktif di halaman ini.');
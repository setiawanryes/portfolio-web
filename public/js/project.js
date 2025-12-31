

// 1. Import Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import {
  getFirestore, doc, collection, getDoc, setDoc, updateDoc, increment,
  addDoc, onSnapshot, query, orderBy, getDocs, deleteDoc,
  limit, startAfter
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

// 2. Initialize Library
AOS.init({ duration: 800, once: true });

// 3. Avatar Generator
function getOfficeAvatar(name) {
  const icons = [
    "https://img.icons8.com/fluency/96/business-man-in-suit.png",
    "https://img.icons8.com/fluency/96/businesswoman.png",
    "https://img.icons8.com/fluency/96/manager.png",
    "https://img.icons8.com/fluency/96/user-male-circle.png",
    "https://img.icons8.com/fluency/96/user-female-circle.png",
    "https://img.icons8.com/fluency/96/admin-settings-male.png",
    "https://img.icons8.com/fluency/96/engineer.png",
    "https://img.icons8.com/fluency/96/consultant.png",
    "https://img.icons8.com/fluency/96/customer-support.png",
    "https://img.icons8.com/fluency/96/businessman.png"
  ];
  let hash = 0;
  const nameStr = name || "Anonymous";
  for (let i = 0; i < nameStr.length; i++) hash = nameStr.charCodeAt(i) + ((hash << 5) - hash);
  return icons[Math.abs(hash) % icons.length];
}

// 4. Image Slider & Lightbox
const slideContainer = document.querySelector('.slide-project');
const slides = slideContainer ? slideContainer.querySelectorAll('img') : [];
const prevBtn = document.querySelector('.prev');
const nextBtn = document.querySelector('.next');
let index = 0;

function showSlide(i) {
  if (slideContainer) slideContainer.style.transform = `translateX(-${i * 100}%)`;
}

if (nextBtn) nextBtn.addEventListener('click', () => { index = (index + 1) % slides.length; showSlide(index); });
if (prevBtn) prevBtn.addEventListener('click', () => { index = (index - 1 + slides.length) % slides.length; showSlide(index); });

// 5. Lightbox Modal
const modal = document.getElementById("lightboxModal");
const modalImg = document.getElementById("lightboxImg");
const closeBtn = document.querySelector(".close");
const lightboxImages = document.querySelectorAll(".lightbox-img");
const prevImgBtn = document.getElementById("prevImg");
const nextImgBtn = document.getElementById("nextImg");
let currentIndex = 0;

if (modal && modalImg) {
  lightboxImages.forEach((img, i) => {
    img.addEventListener("click", () => {
      modal.style.display = "flex";
      modalImg.src = img.src;
      currentIndex = i;
    });
  });

  if (closeBtn) closeBtn.addEventListener("click", (e) => { e.stopPropagation(); modal.style.display = "none"; });
  modal.addEventListener("click", (e) => { if (e.target === modal) modal.style.display = "none"; });

  if (prevImgBtn) prevImgBtn.addEventListener("click", (e) => { e.stopPropagation(); showImage(currentIndex - 1); });
  if (nextImgBtn) nextImgBtn.addEventListener("click", (e) => { e.stopPropagation(); showImage(currentIndex + 1); });
}

function showImage(idx) {
  if (lightboxImages.length > 0) {
    currentIndex = (idx + lightboxImages.length) % lightboxImages.length;
    if (modalImg) modalImg.src = lightboxImages[currentIndex].src;
  }
}

// 6. Progress Bar
const progressBar = document.getElementById('progress-bar');
const progressText = document.getElementById('progress-text');
function setProgress(percent) {
  if (progressBar && progressText) {
    progressBar.style.width = percent + '%';
    progressText.textContent = percent + '%';
  }
}
setTimeout(() => setProgress(100), 500);

// 7. Comment System with Firebase Firestore
const firebaseConfig = {
  apiKey: "AIzaSyBGS2_U6M-lC0YozJd0FCHpncyNLE1mE2g",
  authDomain: "portfolio-setiawanryes.firebaseapp.com",
  projectId: "portfolio-setiawanryes",
  storageBucket: "portfolio-setiawanryes.firebasestorage.app",
  messagingSenderId: "171755400027",
  appId: "1:171755400027:web:6bbbbbda56613af0b4087e",
  measurementId: "G-4R3C18RXW0"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const pageId = window.PAGE_ID || 'workload_analyst';
const pageLikeDoc = doc(db, 'post_reactions', pageId);
const commentsCollection = collection(db, 'comments', pageId, 'list');

const pageSize = 5;
let lastVisible = null;
let isLoadingMore = false;

// 8. DOM Elements
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
const loadMoreBtn = document.getElementById('load-more-comments');
const notifyBadge = document.getElementById('comment-notify-badge');

// 9. Utility Functions
function escapeHtml(s = '') {
  return String(s).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#039;');
}
function formatWaktu(ts) {
  if (!ts) return '';
  const diff = Math.floor((new Date() - new Date(ts)) / 1000);
  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return new Date(ts).toLocaleDateString();
}
function canLikeCommentLocal(id) { return !localStorage.getItem(`${pageId}-liked-${id}`); }
function markLikedLocal(id) { localStorage.setItem(`${pageId}-liked-${id}`, '1'); }

// 10. Initialize Page Like System
async function initPageLike() {
  try {
    const s = await getDoc(pageLikeDoc);
    if (!s.exists()) await setDoc(pageLikeDoc, { likes: 0 });
    onSnapshot(pageLikeDoc, snap => { if (snap.exists() && likeCount) likeCount.textContent = snap.data().likes || 0; });
    if (likeBtn) likeBtn.addEventListener('click', async () => {
      await updateDoc(pageLikeDoc, { likes: increment(1) });
      likeBtn.classList.add('liked');
    });
  } catch (e) { console.error(e); }
}
initPageLike();

// 11. Render Comment
function renderComment(docSnap, container, parentId = null) {
  const data = docSnap.data();
  const id = docSnap.id;
  const created = data.timestamp || Date.now();

  // HTML Structure: Komentar Utama atau Balasan
  const div = document.createElement('div');
  div.className = 'cmtApp-comment';
  div.innerHTML = `
    <div class="cmtApp-comment-header">
      <img src="${escapeHtml(data.avatar || getOfficeAvatar(data.nama))}" alt="Avatar">
      <strong>${escapeHtml(data.nama || 'Anonymous')}</strong>
    </div>
    <div class="cmtApp-comment-body">${escapeHtml(data.isi)}</div>
    <div class="cmtApp-comment-footer">
      <div class="cmtApp-comment-actions">
        <button class="cmtApp-like">${canLikeCommentLocal(id) ? '👍' : '💖'} ${data.likes || 0}</button>
        <button class="cmtApp-reply">Reply</button>
        <button class="cmtApp-edit">Edit</button>
        <button class="cmtApp-delete">Delete</button>
      </div>
      <span class="cmtApp-time">${formatWaktu(created)}</span>
    </div>
    <div class="cmtApp-replies"></div>
  `;
  container.appendChild(div);
  // 1. LIKE
  const likeBtnLocal = div.querySelector('.cmtApp-like');
  if (likeBtnLocal) likeBtnLocal.addEventListener('click', async () => {
    if (!canLikeCommentLocal(id)) return alert('Already liked!');
    const ref = parentId ? doc(db, 'comments', pageId, 'list', parentId, 'replies', id) : doc(db, 'comments', pageId, 'list', id);
    await updateDoc(ref, { likes: increment(1) });
    markLikedLocal(id);
  });
  // 2. REPLY
  const replyBtn = div.querySelector('.cmtApp-reply');
  if (replyBtn) replyBtn.addEventListener('click', () => {
    window.CMT_REPLY_TO = { id, el: div };
    const modalTitle = document.querySelector('#cmtAppModal h3');
    if (modalTitle) modalTitle.textContent = `Reply to ${data.nama}`;
    komentarModal.classList.add('show');
    isiInput.focus();
  });
  // 3. EDIT
  const editBtn = div.querySelector('.cmtApp-edit');
  if (editBtn) editBtn.addEventListener('click', async () => {
    const confirmName = prompt("Enter your name to verify ownership:");
    if (!confirmName || confirmName.trim() !== data.nama) return alert("Incorrect name!");

    const newText = prompt("Edit your comment:", data.isi);
    if (newText && newText !== data.isi) {
      const ref = parentId ? doc(db, 'comments', pageId, 'list', parentId, 'replies', id) : doc(db, 'comments', pageId, 'list', id);
      await updateDoc(ref, { isi: newText });
    }
  });

  // 4. DELETE
  const deleteBtn = div.querySelector('.cmtApp-delete');
  if (deleteBtn) deleteBtn.addEventListener('click', async () => {
    const confirmName = prompt("Enter your name to delete:");
    if (!confirmName || confirmName.trim() !== data.nama) return alert("Incorrect name!");

    if (!confirm("Are you sure?")) return;

    const ref = parentId ? doc(db, 'comments', pageId, 'list', parentId, 'replies', id) : doc(db, 'comments', pageId, 'list', id);
    await deleteDoc(ref);
    div.remove();
  });

  // LOAD REPLIES
  const repliesContainer = div.querySelector('.cmtApp-replies');
  const repliesRef = collection(db, 'comments', pageId, 'list', id, 'replies');
  const qRep = query(repliesRef, orderBy('timestamp', 'asc'));
  onSnapshot(qRep, snap => {
    repliesContainer.innerHTML = '';
    if (snap.size > 0) {
      replyBtn.textContent = `Reply (${snap.size})`;
      snap.forEach(subDoc => renderComment(subDoc, repliesContainer, id));
    } else {
      replyBtn.textContent = `Reply`;
    }
    updateCount();
  });
}

// Update Total Count
function updateCount() {
  if (!komentarCountSpan) return;
  const count = document.querySelectorAll('.cmtApp-comment').length;
  komentarCountSpan.textContent = count;
}

// Load Initial Comments
const q = query(commentsCollection, orderBy('timestamp', 'desc'), limit(pageSize));
onSnapshot(q, snap => {
  if (komentarList) {
    komentarList.innerHTML = '';
    snap.forEach(docSnap => renderComment(docSnap, komentarList));
    if (snap.docs.length > 0) lastVisible = snap.docs[snap.docs.length - 1];
    updateCount();
  }
});

// Load More
if (loadMoreBtn) loadMoreBtn.addEventListener('click', async () => {
  if (isLoadingMore || !lastVisible) return;
  isLoadingMore = true;
  const qMore = query(commentsCollection, orderBy('timestamp', 'desc'), startAfter(lastVisible), limit(pageSize));
  const snap = await getDocs(qMore);
  if (!snap.empty) {
    snap.forEach(docSnap => renderComment(docSnap, komentarList));
    lastVisible = snap.docs[snap.docs.length - 1];
  } else {
    loadMoreBtn.style.display = 'none';
  }
  isLoadingMore = false;
});

// Send Comment (New / Reply)
if (kirimBtn) kirimBtn.addEventListener('click', async () => {
  const nama = namaInput.value.trim();
  const isi = isiInput.value.trim();
  if (!nama || !isi) return alert("Please fill name and message");

  const payload = {
    nama, isi,
    avatar: getOfficeAvatar(nama),
    likes: 0,
    timestamp: Date.now()
  };

  const replyTo = window.CMT_REPLY_TO;

  if (replyTo && replyTo.id) {
    // Save as Reply
    await addDoc(collection(db, 'comments', pageId, 'list', replyTo.id, 'replies'), payload);
    window.CMT_REPLY_TO = null;
  } else {
    // Save as New Comment
    await addDoc(commentsCollection, payload);
  }

  namaInput.value = ''; isiInput.value = '';
  komentarModal.classList.remove('show');

  // Reset Title
  const modalTitle = document.querySelector('#cmtAppModal h3');
  if (modalTitle) modalTitle.textContent = "Join Discussion";
});

// Modal UI Handlers
if (komentarBtn) komentarBtn.addEventListener('click', () => {
  window.CMT_REPLY_TO = null;
  document.querySelector('#cmtAppModal h3').textContent = "Join Discussion";
  komentarModal.classList.add('show');
});
if (closeModalBtn) closeModalBtn.addEventListener('click', () => komentarModal.classList.remove('show'));
window.addEventListener('click', e => { if (e.target === komentarModal) komentarModal.classList.remove('show'); });
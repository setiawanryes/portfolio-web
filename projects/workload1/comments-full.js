// === FIREBASE INIT ===
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import {
  getFirestore,
  collection,
  doc,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  limit,
  increment,
  where,
  getDoc
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

// === KONFIG FIREBASE (GANTI PUNYA KAMU) ===
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// === VARIABEL GLOBAL ===
const commentsList = document.getElementById("comments-list");
const komentarCountEl = document.getElementById("komentar-count");
const sortingSelect = document.getElementById("comment-sorting");
const loadMoreBtn = document.getElementById("load-more-comments");

const PAGE_ID = window.PAGE_ID || "default_page";
const commentsRef = collection(db, "comments");
let currentSort = "newest";
let lastVisible = null;
const PAGE_SIZE = 5;

// === MUAT KOMENTAR ===
async function loadComments(initial = true) {
  let q;
  if (currentSort === "newest") {
    q = query(commentsRef, where("page", "==", PAGE_ID), orderBy("timestamp", "desc"), limit(PAGE_SIZE));
  } else if (currentSort === "oldest") {
    q = query(commentsRef, where("page", "==", PAGE_ID), orderBy("timestamp", "asc"), limit(PAGE_SIZE));
  } else {
    q = query(commentsRef, where("page", "==", PAGE_ID), orderBy("likes", "desc"), limit(PAGE_SIZE));
  }

  const snap = await getDocs(q);
  if (snap.empty) {
    if (initial) commentsList.innerHTML = "<p class='no-comments'>Belum ada komentar.</p>";
    return;
  }

  if (initial) commentsList.innerHTML = "";
  snap.forEach(docSnap => {
    const cmt = { id: docSnap.id, ...docSnap.data() };
    renderComment(cmt);
  });

  lastVisible = snap.docs[snap.docs.length - 1];
  updateCommentCount();
}

// === RENDER KOMENTAR ===
function renderComment(cmt, isReply = false, parentId = null) {
  const div = document.createElement("div");
  div.className = isReply ? "reply-item" : "comment-item";
  div.innerHTML = `
    <div class="comment-header">
      <strong>${cmt.name}</strong>
      <span class="comment-date">${new Date(cmt.timestamp).toLocaleString()}</span>
    </div>
    <div class="comment-body">${cmt.text}</div>
    <div class="comment-actions">
      <button class="like-btn" data-id="${cmt.id}" data-reply="${isReply}" data-parent="${parentId || ""}">❤️ ${cmt.likes || 0}</button>
      <button class="reply-btn" data-id="${cmt.id}" data-name="${cmt.name}">Balas</button>
      <button class="edit-btn" data-id="${cmt.id}" data-reply="${isReply}" data-parent="${parentId || ""}">Edit</button>
      <button class="delete-btn" data-id="${cmt.id}" data-reply="${isReply}" data-parent="${parentId || ""}">Hapus</button>
    </div>
    <div class="replies" id="replies-${cmt.id}"></div>
  `;
  commentsList.appendChild(div);

  // render reply kalau ada
  if (cmt.replies && Array.isArray(cmt.replies)) {
    cmt.replies.forEach(r => renderReply(r, cmt.id));
  }
}

function renderReply(reply, parentId) {
  const div = document.createElement("div");
  div.className = "reply-item";
  div.innerHTML = `
    <div class="comment-header">
      <strong>${reply.name}</strong>
      <span class="comment-date">${new Date(reply.timestamp).toLocaleString()}</span>
    </div>
    <div class="comment-body">${reply.text}</div>
    <div class="comment-actions">
      <button class="like-btn" data-id="${reply.id}" data-reply="true" data-parent="${parentId}">❤️ ${reply.likes || 0}</button>
      <button class="edit-btn" data-id="${reply.id}" data-reply="true" data-parent="${parentId}">Edit</button>
      <button class="delete-btn" data-id="${reply.id}" data-reply="true" data-parent="${parentId}">Hapus</button>
    </div>
  `;
  document.getElementById(`replies-${parentId}`).appendChild(div);
}

// === TAMBAH KOMENTAR ===
async function addComment(name, text) {
  if (!name.trim() || !text.trim()) return;
  await addDoc(commentsRef, {
    page: PAGE_ID,
    name,
    text,
    likes: 0,
    timestamp: Date.now(),
    replies: []
  });
  loadComments();
}

// === EDIT / HAPUS / LIKE ===
commentsList.addEventListener("click", async (e) => {
  const target = e.target;
  const id = target.dataset.id;
  const isReply = target.dataset.reply === "true";
  const parentId = target.dataset.parent;

  // LIKE
  if (target.classList.contains("like-btn")) {
    if (isReply) {
      const parentDoc = await getDoc(doc(db, "comments", parentId));
      if (!parentDoc.exists()) return;
      const parentData = parentDoc.data();
      const replies = parentData.replies || [];
      const idx = replies.findIndex(r => r.id === id);
      if (idx >= 0) {
        replies[idx].likes = (replies[idx].likes || 0) + 1;
        await updateDoc(doc(db, "comments", parentId), { replies });
        loadComments(false);
      }
    } else {
      await updateDoc(doc(db, "comments", id), { likes: increment(1) });
      loadComments(false);
    }
  }

  // EDIT
  if (target.classList.contains("edit-btn")) {
    const newText = prompt("Edit komentar:");
    if (!newText) return;

    if (isReply) {
      const parentDoc = await getDoc(doc(db, "comments", parentId));
      if (!parentDoc.exists()) return;
      const parentData = parentDoc.data();
      const replies = parentData.replies || [];
      const idx = replies.findIndex(r => r.id === id);
      if (idx >= 0) {
        replies[idx].text = newText;
        await updateDoc(doc(db, "comments", parentId), { replies });
        loadComments(false);
      }
    } else {
      await updateDoc(doc(db, "comments", id), { text: newText });
      loadComments(false);
    }
  }

  // HAPUS
  if (target.classList.contains("delete-btn")) {
    if (!confirm("Yakin hapus komentar ini?")) return;
    if (isReply) {
      const parentDoc = await getDoc(doc(db, "comments", parentId));
      if (!parentDoc.exists()) return;
      const parentData = parentDoc.data();
      const newReplies = (parentData.replies || []).filter(r => r.id !== id);
      await updateDoc(doc(db, "comments", parentId), { replies: newReplies });
    } else {
      await deleteDoc(doc(db, "comments", id));
    }
    loadComments();
  }

  // REPLY
  if (target.classList.contains("reply-btn")) {
    const name = prompt("Nama:");
    const text = prompt("Balasan:");
    if (!name || !text) return;

    const parentDocRef = doc(db, "comments", id);
    const parentDoc = await getDoc(parentDocRef);
    const parentData = parentDoc.data();

    const newReply = {
      id: Date.now().toString(),
      name,
      text,
      timestamp: Date.now(),
      likes: 0
    };

    const replies = parentData.replies ? [...parentData.replies, newReply] : [newReply];
    await updateDoc(parentDocRef, { replies });
    loadComments(false);
  }
});

// === SORTING & LOAD MORE ===
sortingSelect.addEventListener("change", () => {
  currentSort = sortingSelect.value;
  loadComments();
});

loadMoreBtn.addEventListener("click", () => {
  loadComments(false);
});

// === UPDATE JUMLAH KOMENTAR ===
async function updateCommentCount() {
  const snap = await getDocs(query(commentsRef, where("page", "==", PAGE_ID)));
  let total = 0;
  snap.forEach(docSnap => {
    const data = docSnap.data();
    total++;
    if (Array.isArray(data.replies)) total += data.replies.length;
  });
  komentarCountEl.textContent = total;
}

// === INISIALISASI ===
loadComments();

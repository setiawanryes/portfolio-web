
// 1. Import Library Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
  getFirestore, collection, addDoc, onSnapshot, query, orderBy, serverTimestamp, 
  doc, updateDoc, arrayUnion, increment 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { 
  getStorage, ref, uploadBytes, getDownloadURL 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js";

// 2. DETEKSI ID HALAMAN
const PAGE_ID = window.PAGE_ID || "guestbook_main";
console.log(`💬 System Komentar Aktif untuk: ${PAGE_ID}`);

// 3. Konfigurasi Firebase (Milikmu)
const firebaseConfig = {
  apiKey: "AIzaSyBGS2_U6M-lC0YozJd0FCHpncyNLE1mE2g",
  authDomain: "portfolio-setiawanryes.firebaseapp.com",
  projectId: "portfolio-setiawanryes",
  storageBucket: "portfolio-setiawanryes.firebasestorage.app",
  messagingSenderId: "171755400027",
  appId: "1:171755400027:web:6bbbbbda56613af0b4087e",
  measurementId: "G-4R3C18RXW0"
};

// 4. Inisialisasi Aplikasi
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

// 5. Referensi Database
const commentsRef = collection(db, "comments", PAGE_ID, "list");

// 6. DOM Elements
const commentForm = document.getElementById('commentForm');
const commentList = document.getElementById('commentList');
const nameInput = document.getElementById('commentName');
const msgInput = document.getElementById('commentText');
const photoInput = document.getElementById('profilePhoto');
const fileBtnIcon = document.querySelector('.file-btn i');


if (photoInput) {
  photoInput.addEventListener('change', function() {
    if (this.files && this.files[0]) {
      fileBtnIcon.style.color = '#10b981'; 
      fileBtnIcon.className = 'fas fa-check-circle'; 
    }
  });
}


if (commentForm) {
  commentForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = nameInput.value.trim();
    const text = msgInput.value.trim();
    const file = photoInput ? photoInput.files[0] : null;

    if (!name || !text) {
      alert("Silakan isi Nama dan Pesan!");
      return;
    }

    const submitBtn = commentForm.querySelector('.send-chat-btn');
    const originalIcon = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>'; 
    submitBtn.disabled = true;

    try {
      let photoURL = null;

      if (file) {
        const storagePath = `comments_photos/${PAGE_ID}/${Date.now()}_${file.name}`;
        const storageRef = ref(storage, storagePath);
        const snapshot = await uploadBytes(storageRef, file);
        photoURL = await getDownloadURL(snapshot.ref);
      }

      await addDoc(commentsRef, {
        name: name,
        text: text,
        photoURL: photoURL,
        timestamp: serverTimestamp(),
        likes: 0,
        replies: [] 
      });

      commentForm.reset();
      if(fileBtnIcon) {
        fileBtnIcon.style.color = ''; 
        fileBtnIcon.className = 'fas fa-camera'; 
      }

    } catch (error) {
      console.error("Error:", error);
      alert("Gagal mengirim pesan.");
    } finally {
      submitBtn.innerHTML = originalIcon;
      submitBtn.disabled = false;
    }
  });
}


if (commentList) {
  commentList.addEventListener('click', async (e) => {
    
    if (e.target.closest('.btn-like')) {
      const btn = e.target.closest('.btn-like');
      const docId = btn.dataset.id;
      const storageKey = `liked_${docId}`;

      if (localStorage.getItem(storageKey)) {
        alert("Kamu sudah menyukai komentar ini!");
        return;
      }

      const docRef = doc(db, "comments", PAGE_ID, "list", docId);
      await updateDoc(docRef, {
        likes: increment(1)
      });

      localStorage.setItem(storageKey, true);
      btn.classList.add('liked'); 
    }


    if (e.target.closest('.btn-reply-toggle')) {
      const btn = e.target.closest('.btn-reply-toggle');
      const docId = btn.dataset.id;
      const formContainer = document.getElementById(`reply-form-${docId}`);
      
  
      if (formContainer.style.display === "block") {
        formContainer.style.display = "none";
      } else {
        formContainer.style.display = "block";
        formContainer.querySelector('input').focus(); 
      }
    }

  
    if (e.target.closest('.btn-send-reply')) {
      const btn = e.target.closest('.btn-send-reply');
      const docId = btn.dataset.id;
      
      const replyNameInput = document.getElementById(`reply-name-${docId}`);
      const replyMsgInput = document.getElementById(`reply-text-${docId}`);
      
      const rName = replyNameInput.value.trim();
      const rText = replyMsgInput.value.trim();

      if (!rName || !rText) return alert("Isi nama dan balasan!");

      btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
      btn.disabled = true;

      try {
        const docRef = doc(db, "comments", PAGE_ID, "list", docId);
        
        const newReply = {
          name: rName,
          text: rText,
          timestamp: Date.now() 
        };

        await updateDoc(docRef, {
          replies: arrayUnion(newReply)
        });

      
        replyNameInput.value = "";
        replyMsgInput.value = "";
        document.getElementById(`reply-form-${docId}`).style.display = "none";

      } catch (error) {
        console.error("Gagal membalas:", error);
        alert("Gagal mengirim balasan.");
      } finally {
        btn.innerHTML = 'Kirim';
        btn.disabled = false;
      }
    }
  });
}


const q = query(commentsRef, orderBy("timestamp", "desc"));

onSnapshot(q, (snapshot) => {
  const commentsHTML = [];

  snapshot.forEach((doc) => {
    const data = doc.data();
    const docId = doc.id;
    
 
    let timeString = 'Baru saja';
    if (data.timestamp) {
        const date = new Date(data.timestamp.seconds * 1000);
        timeString = date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
    }
    
    let avatarImg;
    if (data.photoURL) {
      avatarImg = `<img src="${data.photoURL}" alt="${data.name}" class="comment-avatar">`;
    } else {
      avatarImg = `<img src="https://ui-avatars.com/api/?name=${encodeURIComponent(data.name)}&background=random&color=fff&size=128" alt="${data.name}" class="comment-avatar">`;
    }

    const isLiked = localStorage.getItem(`liked_${docId}`) ? 'liked' : '';


    let repliesHTML = '';
    if (data.replies && data.replies.length > 0) {
      repliesHTML = `<div class="replies-list">`;
      data.replies.forEach(reply => {
        const rTime = new Date(reply.timestamp).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
        repliesHTML += `
          <div class="reply-item">
            <div class="reply-header">
              <span class="reply-author">${escapeHtml(reply.name)}</span>
              <span class="reply-date">${rTime}</span>
            </div>
            <div class="reply-text">${escapeHtml(reply.text)}</div>
          </div>
        `;
      });
      repliesHTML += `</div>`;
    }

    const html = `
      <div class="cmtApp-comment" id="comment-${docId}">
        ${avatarImg}
        <div style="flex:1;">
          <div class="cmtApp-comment-header">
            <span class="cmtApp-author" style="font-weight:700; color:#1e293b; font-size:0.9rem;">${escapeHtml(data.name)}</span>
            <span class="cmtApp-time" style="font-size:0.7rem; color:#94a3b8; margin-left:auto;">${timeString}</span>
          </div>
          
          <div class="cmtApp-body" style="font-size:0.9rem; color:#475569; line-height:1.5; margin-top:4px;">
            ${escapeHtml(data.text)}
          </div>

          <div class="comment-actions">
            <button class="btn-action btn-like ${isLiked}" data-id="${docId}">
              <i class="${isLiked ? 'fas' : 'far'} fa-heart"></i> 
              <span>${data.likes || 0}</span>
            </button>
            <button class="btn-action btn-reply-toggle" data-id="${docId}">
              <i class="far fa-comment-alt"></i> Balas
            </button>
          </div>

          <div class="reply-input-container" id="reply-form-${docId}">
            <div class="reply-form-row">
              <input type="text" id="reply-name-${docId}" placeholder="Nama kamu" class="reply-input" style="width:30%;">
              <input type="text" id="reply-text-${docId}" placeholder="Tulis balasan..." class="reply-input">
              <button class="btn-send-reply" data-id="${docId}">Kirim</button>
            </div>
          </div>

          ${repliesHTML}

        </div>
      </div>
    `;
    commentsHTML.push(html);
  });

  if (commentList) {
    if (commentsHTML.length > 0) {
      commentList.innerHTML = commentsHTML.join('');
    } else {
      commentList.innerHTML = `
        <div class="empty-state">
          <i class="far fa-comment-dots"></i>
          <p>Belum ada pesan. Jadilah yang pertama menyapa!</p>
        </div>
      `;
    }
  }
});

function escapeHtml(text) {
  if (!text) return text;
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
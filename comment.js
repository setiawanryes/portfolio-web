

// 1. Import Firebase Library
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
  getFirestore, collection, addDoc, onSnapshot, query, orderBy, serverTimestamp, 
  doc, updateDoc, arrayUnion, increment 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { 
  getStorage, ref, uploadBytes, getDownloadURL 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js";

// 2. DETECT PAGE ID
const PAGE_ID = window.PAGE_ID || "guestbook_main";
console.log(`💬 Comment System Active for: ${PAGE_ID}`);

// 3. Firebase Configuration (Yours)
const firebaseConfig = {
  apiKey: "AIzaSyBGS2_U6M-lC0YozJd0FCHpncyNLE1mE2g",
  authDomain: "portfolio-setiawanryes.firebaseapp.com",
  projectId: "portfolio-setiawanryes",
  storageBucket: "portfolio-setiawanryes.firebasestorage.app",
  messagingSenderId: "171755400027",
  appId: "1:171755400027:web:6bbbbbda56613af0b4087e",
  measurementId: "G-4R3C18RXW0"
};

// 4. Initialize App
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

// 5. Database Reference
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
      alert("Please enter your Name and Message!");
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
      alert("Failed to send message.");
    } finally {
      submitBtn.innerHTML = originalIcon;
      submitBtn.disabled = false;
    }
  });
}


if (commentList) {
  commentList.addEventListener('click', async (e) => {
    
    // --- A. CLICK LIKE BUTTON ---
    if (e.target.closest('.btn-like')) {
      const btn = e.target.closest('.btn-like');
      const docId = btn.dataset.id;
      const storageKey = `liked_${docId}`;

      // Check LocalStorage to prevent spamming likes
      if (localStorage.getItem(storageKey)) {
        alert("You already liked this comment!");
        return;
      }

      // Update Firestore (Increment)
      const docRef = doc(db, "comments", PAGE_ID, "list", docId);
      await updateDoc(docRef, {
        likes: increment(1)
      });

      // Save like status in user browser
      localStorage.setItem(storageKey, true);
      btn.classList.add('liked'); 
    }

    // --- B. CLICK REPLY TOGGLE (Show Form) ---
    if (e.target.closest('.btn-reply-toggle')) {
      const btn = e.target.closest('.btn-reply-toggle');
      const docId = btn.dataset.id;
      const formContainer = document.getElementById(`reply-form-${docId}`);
      
      // Toggle visibility
      if (formContainer.style.display === "block") {
        formContainer.style.display = "none";
      } else {
        formContainer.style.display = "block";
        formContainer.querySelector('input').focus(); 
      }
    }

    // --- C. CLICK SEND REPLY ---
    if (e.target.closest('.btn-send-reply')) {
      const btn = e.target.closest('.btn-send-reply');
      const docId = btn.dataset.id;
      
      const replyNameInput = document.getElementById(`reply-name-${docId}`);
      const replyMsgInput = document.getElementById(`reply-text-${docId}`);
      
      const rName = replyNameInput.value.trim();
      const rText = replyMsgInput.value.trim();

      if (!rName || !rText) return alert("Please enter your name and reply message.");

      btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
      btn.disabled = true;

      try {
        // Update Comment Document: Add data to 'replies' Array
        const docRef = doc(db, "comments", PAGE_ID, "list", docId);
        
        const newReply = {
          name: rName,
          text: rText,
          timestamp: Date.now() 
        };

        await updateDoc(docRef, {
          replies: arrayUnion(newReply)
        });

        // Reset Reply Form
        replyNameInput.value = "";
        replyMsgInput.value = "";
        document.getElementById(`reply-form-${docId}`).style.display = "none";

      } catch (error) {
        console.error("Failed to reply:", error);
        alert("Failed to send reply.");
      } finally {
        btn.innerHTML = 'Send';
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
    
    // Time Format
    let timeString = 'Just now';
    if (data.timestamp) {
        const date = new Date(data.timestamp.seconds * 1000);
        // Changed locale to en-US for English format
        timeString = date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
    }
    
    // Avatar Logic
    let avatarImg;
    if (data.photoURL) {
      avatarImg = `<img src="${data.photoURL}" alt="${data.name}" class="comment-avatar">`;
    } else {
      avatarImg = `<img src="https://ui-avatars.com/api/?name=${encodeURIComponent(data.name)}&background=random&color=fff&size=128" alt="${data.name}" class="comment-avatar">`;
    }

    // Check if user liked this comment
    const isLiked = localStorage.getItem(`liked_${docId}`) ? 'liked' : '';

    // Render Replies
    let repliesHTML = '';
    if (data.replies && data.replies.length > 0) {
      repliesHTML = `<div class="replies-list">`;
      data.replies.forEach(reply => {
        const rTime = new Date(reply.timestamp).toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
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
              <i class="far fa-comment-alt"></i> Reply
            </button>
          </div>

          <div class="reply-input-container" id="reply-form-${docId}">
            <div class="reply-form-row">
              <input type="text" id="reply-name-${docId}" placeholder="Your Name" class="reply-input" style="width:30%;">
              <input type="text" id="reply-text-${docId}" placeholder="Write a reply..." class="reply-input">
              <button class="btn-send-reply" data-id="${docId}">Send</button>
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
          <p>No messages yet. Be the first to say hello!</p>
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
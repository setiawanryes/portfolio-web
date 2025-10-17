// Daftar teks role
const roles = [
  "Administrasi HR",
  "Staff Admin",
  "Analyst Data",
  "Welcome Web Developer"
];

let index = 0;
const roleContainer = document.getElementById("role-text");

function changeRole() {
  // Animasi keluar
  roleContainer.style.animation = "slideOut 0.6s ease forwards";

  setTimeout(() => {
    // Ganti teks setelah animasi keluar
    index = (index + 1) % roles.length;
    roleContainer.textContent = roles[index];

    // Animasi masuk
    roleContainer.style.animation = "slideIn 0.6s ease forwards";
  }, 600);
}

// Ganti teks setiap 3 detik
setInterval(changeRole, 3000);

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("commentForm");
  const commentList = document.getElementById("commentList");

  // Email pemilik website (yang bisa hapus komentar)
  const ownerEmail = "ronisetiawan496@gmail.com";

  // Ambil komentar dari localStorage
  let comments = JSON.parse(localStorage.getItem("comments")) || [];

  // Tampilkan semua komentar
  function renderComments() {
    commentList.innerHTML = "";
    comments.forEach((comment, index) => {
      const commentBox = document.createElement("div");
      commentBox.className = "comment-box";

      commentBox.innerHTML = `
        <div class="comment-header">
          <img src="${comment.photo}" alt="Profile" class="comment-avatar">
          <div class="comment-info">
            <h4>${comment.name}</h4>
            <p>${comment.date}</p>
          </div>
        </div>
        <p class="comment-text">${comment.text}</p>
        ${comment.email === ownerEmail
          ? `<button class="delete-btn" data-index="${index}">🗑️ Hapus</button>`
          : ""}
      `;
      commentList.appendChild(commentBox);
    });

    // Tombol hapus
    document.querySelectorAll(".delete-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const index = e.target.getAttribute("data-index");
        comments.splice(index, 1);
        localStorage.setItem("comments", JSON.stringify(comments));
        renderComments();
      });
    });
  }

  renderComments();

  // Form submit
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const name = document.getElementById("name").value.trim();
    const commentText = document.getElementById("comment").value.trim();
    const photoInput = document.getElementById("photo");
    const email = ownerEmail; // email kamu otomatis diset di sini
    const date = new Date().toLocaleString();

    if (!name || !commentText) return;

    // Jika user tidak upload foto, pakai default
    let photo = "images/default-avatar.png";
    if (photoInput.files && photoInput.files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        photo = event.target.result;
        saveComment();
      };
      reader.readAsDataURL(photoInput.files[0]);
    } else {
      saveComment();
    }

    function saveComment() {
      const newComment = { name, text: commentText, date, photo, email };
      comments.push(newComment);
      localStorage.setItem("comments", JSON.stringify(comments));
      renderComments();
      form.reset();
    }
  });
});

// === Firebase Configuration ===
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_DOMAIN",
  databaseURL: "YOUR_DATABASE_URL",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_BUCKET",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// === Inisialisasi Firebase ===
const app = firebase.initializeApp(firebaseConfig);
const db = firebase.database();
const auth = firebase.auth();

// === Referensi Database ===
const commentsRef = db.ref("comments");

// === DOM Elements ===
const form = document.getElementById("commentForm");
const commentList = document.getElementById("commentList");
const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");

// === Submit komentar ===
form.addEventListener("submit", (e) => {
  e.preventDefault();

  const name = document.getElementById("name").value.trim();
  const message = document.getElementById("message").value.trim();

  if (!name || !message) return alert("Please fill out all fields.");

  const newComment = {
    name,
    message,
    time: new Date().toLocaleString(),
  };

  commentsRef.push(newComment);
  form.reset();
});

// === Render komentar ===
commentsRef.on("value", (snapshot) => {
  commentList.innerHTML = "";
  snapshot.forEach((childSnapshot) => {
    const data = childSnapshot.val();
    const id = childSnapshot.key;

    const div = document.createElement("div");
    div.classList.add("comment-item");
    div.innerHTML = `
      <div>
        <h4>${data.name}</h4>
        <p>${data.message}</p>
        <small>${data.time}</small>
      </div>
    `;

    // Jika admin login, tampilkan tombol hapus
    if (auth.currentUser) {
      const delBtn = document.createElement("button");
      delBtn.textContent = "🗑️ Delete";
      delBtn.classList.add("btn-primary");
      delBtn.style.background = "#ff7070";
      delBtn.style.marginLeft = "10px";
      delBtn.onclick = () => commentsRef.child(id).remove();
      div.appendChild(delBtn);
    }

    commentList.appendChild(div);
  });
});

// === Login Admin ===
loginBtn.addEventListener("click", () => {
  const email = document.getElementById("adminEmail").value;
  const password = document.getElementById("adminPassword").value;

  auth.signInWithEmailAndPassword(email, password)
    .then(() => {
      alert("Login berhasil!");
      loginBtn.style.display = "none";
      logoutBtn.style.display = "inline-block";
    })
    .catch((err) => alert(err.message));
});

// === Logout ===
logoutBtn.addEventListener("click", () => {
  auth.signOut();
  loginBtn.style.display = "inline-block";
  logoutBtn.style.display = "none";
  alert("Logout berhasil!");
});

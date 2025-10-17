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

async function postComment(e) {
  e.preventDefault();
  const name = document.getElementById("name").value.trim();
  const comment = document.getElementById("comment").value.trim();

  if (!name || !comment) {
    alert("Tolong isi nama dan komentar dulu ya.");
    return;
  }

  const res = await fetch("/.netlify/functions/comment", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title: name, body: comment }),
  });

  if (res.ok) {
    alert("Komentar terkirim! Tunggu sebentar untuk muncul di bawah.");
    document.getElementById("commentForm").reset();
    loadComments();
  } else {
    alert("Gagal mengirim komentar 😥");
  }
}

// === Konfigurasi ===
const USER = "setiawanryes";
const REPO = "portfolio-web";

// === Ambil komentar dari Issues ===
async function loadComments() {
  const res = await fetch(`https://api.github.com/repos/${USER}/${REPO}/issues`);
  const issues = await res.json();
  const list = document.getElementById("commentList");
  list.innerHTML = "";

  issues.forEach(issue => {
    const div = document.createElement("div");
    div.classList.add("comment-item");
    div.innerHTML = `
      <div class="comment-content">
        <h4>${issue.title}</h4>
        <p>${issue.body}</p>
      </div>
    `;
    list.appendChild(div);
  });
}

// === Kirim komentar baru (aman via repository_dispatch) ===
async function postComment(e) {
  e.preventDefault();

  const name = document.getElementById("name").value;
  const comment = document.getElementById("comment").value;

  const data = {
    event_type: "comment",
    client_payload: {
      title: name,
      body: comment
    }
  };

  await fetch(`https://api.github.com/repos/${USER}/${REPO}/dispatches`, {
    method: "POST",
    headers: {
      "Accept": "application/vnd.github+json",
      "Authorization": "Bearer YOUR_PUBLIC_TRIGGER_TOKEN", // opsional, nanti bisa aku bantu buatkan via proxy
    },
    body: JSON.stringify(data),
  });

  document.getElementById("commentForm").reset();
  loadComments();
}

document.getElementById("commentForm").addEventListener("submit", postComment);
document.addEventListener("DOMContentLoaded", loadComments);

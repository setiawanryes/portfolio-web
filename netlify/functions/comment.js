// netlify/functions/comment.js

import fetch from "node-fetch";

export async function handler(event) {
  try {
    const { title, body } = JSON.parse(event.body);
    const repo = "setiawanryes/portfolio-web"; // ganti sesuai nama repo kamu
    const token = process.env.GH_TOKEN;

    const res = await fetch(`https://api.github.com/repos/${repo}/issues`, {
      method: "POST",
      headers: {
        Authorization: `token ${token}`,
        "Content-Type": "application/json",
        Accept: "application/vnd.github+json",
      },
      body: JSON.stringify({ title, body }),
    });

    if (!res.ok) {
      const error = await res.text();
      return { statusCode: res.status, body: error };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Comment sent successfully!" }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
}

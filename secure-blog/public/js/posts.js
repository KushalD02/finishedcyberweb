// js/posts.js

let csrfToken = '';

// Fetch the CSRF token
fetch('/csrf-token')
  .then(res => res.json())
  .then(data => {
    csrfToken = data.csrfToken;

    // Enable form once CSRF token is ready
    document.getElementById('post-form').querySelector('button').disabled = false;
  })
  .catch(err => {
    console.error('Failed to fetch CSRF token:', err);
  });

// CREATE a new post
document.getElementById('post-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const title = document.getElementById('post-title').value;
  const content = document.getElementById('post-content').value;

  const res = await fetch('/posts', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'CSRF-Token': csrfToken // ✅ CSRF token added
    },
    body: JSON.stringify({ title, content })
  });

  alert(await res.text());
  e.target.reset(); // clear form
  loadLatestPosts();
});

// LOAD and display all posts
export async function loadLatestPosts() {
  const res = await fetch('/posts');
  const posts = await res.json();

  const postsList = document.getElementById('postsList');
  postsList.innerHTML = '';

  posts.forEach(post => {
    const article = document.createElement('article');
    article.innerHTML = `
      <h3>${post.title}</h3>
      <p><strong>By:</strong> ${post.username} | <em>${post.timestamp}</em></p>
      <p>${post.content}</p>
      <button onclick="editPost(${post.id}, '${sanitize(post.title)}', \`${sanitize(post.content)}\`)">Edit</button>
      <button onclick="deletePost(${post.id})">Delete</button>
      <hr />
    `;
    postsList.appendChild(article);
  });
}

// UPDATE post
window.editPost = (id, oldTitle, oldContent) => {
  const newTitle = prompt("Edit title:", oldTitle);
  const newContent = prompt("Edit content:", oldContent);

  if (!newTitle || !newContent) {
    alert("Title and content are required.");
    return;
  }

  fetch(`/posts/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'CSRF-Token': csrfToken // ✅ CSRF token added
    },
    body: JSON.stringify({ title: newTitle, content: newContent })
  })
    .then(res => res.text())
    .then(msg => {
      alert("Updated: " + msg);
      loadLatestPosts();
    });
};

// DELETE post
window.deletePost = (id) => {
  if (!confirm("Are you sure you want to delete this post?")) return;

  fetch(`/posts/${id}`, {
    method: 'DELETE',
    headers: {
      'CSRF-Token': csrfToken // ✅ CSRF token added
    }
  })
    .then(res => res.text())
    .then(msg => {
      alert("Deleted: " + msg);
      loadLatestPosts();
    });
};

// Simple sanitization function to escape HTML
function sanitize(str) {
  return str.replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// Load posts on page load
loadLatestPosts();

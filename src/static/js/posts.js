document.addEventListener("DOMContentLoaded", async () => {
    const res = await fetch("http://localhost:3000/admin/blogs/all-posts");
    const data = await res.json();

    let postsContainer = document.getElementById("posts-container");
    data.posts.forEach((post) => {
        postsContainer.innerHTML += `
            <div class="post">
                <h2><a href="single_article.html?id=${post._id}">${post.title}</a></h2>
                <p>${post.body.substring(0, 100)}...</p>
            </div>`;
    });
});

document.addEventListener("DOMContentLoaded", async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get("id");

    const postRes = await fetch(`http://localhost:3000/single-post/${postId}`);
    const postData = await postRes.json();

    document.getElementById("post-title").innerText = postData.post.title;
    document.getElementById("post-body").innerText = postData.post.body;

    // Fetch and display comments
    const commentRes = await fetch(`http://localhost:3000/comments/add-comment/${postId}`);
    const commentData = await commentRes.json();
    let commentSection = document.getElementById("comments");
    commentData.comments.forEach(comment => {
        commentSection.innerHTML += `<p>${comment.body} - by ${comment.fullname}</p>`;
    });
});

async function fetchPosts() {
    try {
        const res = await fetch("http://localhost:3000/admin/blogs/all");
        if (!res.ok) throw new Error("Failed to fetch posts");

        const data = await res.json();
        let postsContainer = document.getElementById("posts-container");

        data.posts.forEach((post) => {
            postsContainer.innerHTML += `
                <div class="post">
                    <h2><a href="single_article.html?id=${post._id}">${post.title}</a></h2>
                    <p>${post.body.substring(0, 100)}...</p>
                </div>`;
        });
    } catch (err) {
        console.error("Error fetching posts:", err);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const newPostForm = document.getElementById("new-post-form");
    if (newPostForm) {
        newPostForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const title = document.getElementById("title").value;
            const body = document.getElementById("body").value;
            const token = localStorage.getItem("accessToken");

            const res = await fetch("http://localhost:3000/admin/blogs/create-post", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ title, body, status: "public" })
            });

            const data = await res.json();
            if (res.ok) {
                alert("Post created successfully!");
                window.location.href = "home.html";
            } else {
                alert("Error creating post: " + data.message);
            }
        });
    }
});


document.addEventListener("DOMContentLoaded", fetchPosts);

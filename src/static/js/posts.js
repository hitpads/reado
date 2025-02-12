document.addEventListener("DOMContentLoaded", async () => {
    const res = await fetch("http://localhost:3000/api/blogs/all-posts");
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

    const postRes = await fetch(`http://localhost:3000/api/blogs/single-post/${postId}`);
    const postData = await postRes.json();

    document.getElementById("post-title").innerText = postData.post.title;
    document.getElementById("post-body").innerText = postData.post.body;

    // Fetch and display comments
    const commentRes = await fetch(`http://localhost:3000/api/comments/post-comment/${postId}`);
    const commentData = await commentRes.json();
    let commentSection = document.getElementById("comments");
    commentData.comments.forEach(comment => {
        commentSection.innerHTML += `<p>${comment.body} - by ${comment.fullname}</p>`;
    });
});

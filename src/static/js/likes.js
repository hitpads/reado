document.getElementById("like-btn").addEventListener("click", async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get("id");

    const res = await fetch(`http://localhost:3000/api/blogs/like/${postId}`, {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${localStorage.getItem("accessToken")}`
        }
    });

    if (res.ok) {
        alert("Post Liked!");
    } else {
        alert("Error liking post.");
    }
});

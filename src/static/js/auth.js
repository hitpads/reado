document.getElementById("login-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    const res = await fetch("http://localhost:3000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
    });

    const data = await res.json();
    if (res.ok) {
        localStorage.setItem("accessToken", data.accessToken);
        window.location.href = "home.html";
    } else {
        alert(data.message);
    }
});

function getDeviceIdentifier() {
    let deviceIdentifier = localStorage.getItem("deviceIdentifier");

    if (!deviceIdentifier) {
        // Generate a random unique identifier (UUID)
        deviceIdentifier = crypto.randomUUID();
        localStorage.setItem("deviceIdentifier", deviceIdentifier);
    }

    return deviceIdentifier;
}

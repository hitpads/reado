// Universal API Request Function (Handles Headers)
async function apiRequest(url, method = "GET", body = null) {
    const token = localStorage.getItem("accessToken");
    const deviceIdentifier = getDeviceIdentifier();

    const headers = {
        "Content-Type": "application/json",
        "deviceIdentifier": deviceIdentifier
    };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    console.log("🔹 API Request Headers:", headers); // ✅ Debugging Log

    const options = { method, headers };
    if (body) options.body = JSON.stringify(body);

    const response = await fetch(url, options);
    return response.json();
}


function getDeviceIdentifier() {
    let deviceIdentifier = localStorage.getItem("deviceIdentifier");
    if (!deviceIdentifier) {
        deviceIdentifier = crypto.randomUUID(); // Generate a unique ID
        localStorage.setItem("deviceIdentifier", deviceIdentifier);
    }
    return deviceIdentifier;
}

document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("login-form");

    if (loginForm) {
        loginForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const email = document.getElementById("email").value;
            const password = document.getElementById("password").value;

            const res = await apiRequest("http://localhost:3000/login", "POST", { email, password });

            if (res.accessToken) {
                localStorage.setItem("accessToken", res.accessToken);
                window.location.href = "home.html";
            } else {
                alert(res.message);
            }
        });
    }
});

document.addEventListener("DOMContentLoaded", () => {
    const registerForm = document.getElementById("register-form");

    if (registerForm) {
        registerForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const fullname = document.getElementById("fullname").value;
            const email = document.getElementById("email").value;
            const password = document.getElementById("password").value;
            const confirmPassword = document.getElementById("confirmPassword").value;

            const res = await apiRequest("http://localhost:3000/register", "POST", {
                fullname, email, password, confirmPassword
            });

            if (res.ok) {
                alert("Registration successful! You can now log in.");
                window.location.href = "login.html";
            } else {
                alert(res.message);
            }
        });
    }
});

document.addEventListener("DOMContentLoaded", () => {
    const logoutBtn = document.getElementById("logout");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            localStorage.removeItem("accessToken");
            window.location.href = "login.html";
        });
    }
});

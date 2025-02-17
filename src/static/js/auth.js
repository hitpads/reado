// Universal API Request Function (Handles Headers)
async function apiRequest(url, method = "GET", body = null) {
    const token = localStorage.getItem("accessToken");
    const deviceIdentifier = getDeviceIdentifier();

    const headers = {
        "Content-Type": "application/json",
        "deviceIdentifier": deviceIdentifier
    };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    console.log("🔹 API Request Headers:", headers);

    const options = { method, headers };
    if (body) options.body = JSON.stringify(body);

    const response = await fetch(url, options);
    return response.json();
}

async function refreshAccessToken() {
    try {
        const res = await fetch("http://localhost:3000/access-token", {
            method: "POST",
            credentials: "include", // ✅ Sends cookies automatically
            headers: {
                "deviceIdentifier": localStorage.getItem("deviceIdentifier")
            }
        });

        const data = await res.json();
        if (res.ok) {
            localStorage.setItem("accessToken", data.accessToken);
            return data.accessToken;
        } else {
            console.error("Failed to refresh token:", data.message);
            return null;
        }
    } catch (error) {
        console.error("Error refreshing token:", error);
        return null;
    }
}

async function fetchWithAuth(url, options = {}) {
    let token = localStorage.getItem("accessToken");

    if (!token) {
        token = await refreshAccessToken();
        if (!token) {
            console.error("User is not authenticated. Redirecting to login...");
            window.location.href = "../login.html";
            return;
        }
    }

    // Authorization header
    options.headers = {
        ...options.headers,
        "Authorization": `Bearer ${token}`
    };

    const res = await fetch(url, options);

    // If token expired, try refreshing it once
    if (res.status === 401) {
        token = await refreshAccessToken();
        if (token) {
            options.headers["Authorization"] = `Bearer ${token}`;
            return fetch(url, options);
        } else {
            window.location.href = "/login.html";
        }
    }

    return res;
}

function getDeviceIdentifier() {
    let deviceIdentifier = localStorage.getItem("deviceIdentifier");
    if (!deviceIdentifier) {
        deviceIdentifier = crypto.randomUUID(); // Generation
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
})



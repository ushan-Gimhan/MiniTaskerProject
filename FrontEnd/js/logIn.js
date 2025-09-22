// ---------------- Password toggle ----------------
function togglePassword() {
    const passwordInput = document.getElementById('password');
    const toggleBtn = document.querySelector('.password-toggle');

    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleBtn.textContent = '🙈';
    } else {
        passwordInput.type = 'password';
        toggleBtn.textContent = '👁️';
    }
}

$(document).ready(function () {
    // ---------------- Form submission ----------------
    $("#loginForm").on("submit", function (e) {
        e.preventDefault();

        const loginBtn = $("#loginBtn");

        loginBtn.addClass("loading").text("");

        // ✅ must match AuthDTO field names
        const username = $("#username").val();
        const password = $("#password").val();

        $.ajax({
            url: "http://localhost:8080/auth/login",  // ✅ backend URL
            method: "POST",
            contentType: "application/json",
            data: JSON.stringify({ username, password }),
            success: function (response) {

                // ✅ extract token (adjust if backend sends `token` instead of `accessToken`)
                const token = response.data?.token || response.data?.accessToken;

                if (token) {
                    // Save the token
                    localStorage.setItem("jwtToken", token);

                    // Decode token payload (assuming JWT format header.payload.signature)
                    let payload;
                    try {
                        payload = JSON.parse(atob(token.split(".")[1]));
                    } catch (e) {
                        Swal.fire("Error", "Invalid token format.", "error");
                        return;
                    }

                    const userRole = payload.role; // backend must include "role" in JWT

                    // Redirect based on role
                    if (userRole === "ADMIN") {
                        Swal.fire({
                            title: "Welcome Admin!",
                            text: "Redirecting to Admin Dashboard...",
                            icon: "success",
                            timer: 2000,
                            showConfirmButton: false
                        }).then(() => {
                            window.location.href = "AdminDashBoard.html";
                        });
                    } else if (userRole === "USER") {
                        Swal.fire({
                            title: "Login Successful!",
                            text: "Redirecting to User Dashboard...",
                            icon: "success",
                            timer: 2000,
                            showConfirmButton: false
                        }).then(() => {
                            window.location.href = "dashboard.html";
                        });
                    } else {
                        Swal.fire({
                            title: "Login Successful!",
                            text: "Redirecting...",
                            icon: "success",
                            timer: 2000,
                            showConfirmButton: false
                        }).then(() => {
                            window.location.href = "dashboard.html"; // fallback
                        });
                    }

                } else {
                    Swal.fire("Error", "Login failed: token missing.", "error");
                }
            },
            error: function (xhr) {
                console.error("Login error:", xhr);
                const msg = xhr.responseJSON?.message || "Invalid credentials. Please try again.";
                Swal.fire("Login Failed", msg, "error");
            },
            complete: function () {
                loginBtn.removeClass("loading").text("Sign In");
            }
        });
    });

    // ---------------- Social login handlers ----------------
    $(".social-btn").on("click", function () {
        const provider = $(this).hasClass("google") ? "Google" : "Facebook";
        Swal.fire("Info", `${provider} login functionality would be implemented here`, "info");
    });

    // ---------------- Input focus animations ----------------
    $(".form-input").on("focus", function () {
        $(this).parent().addClass("focused");
    }).on("blur", function () {
        if (!this.value) {
            $(this).parent().removeClass("focused");
        }
    });
});

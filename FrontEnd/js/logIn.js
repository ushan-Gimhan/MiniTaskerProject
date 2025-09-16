// Password toggle functionality
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
    // Form submission with AJAX
    $("#loginForm").on("submit", function (e) {
        e.preventDefault();

        const loginBtn = $("#loginBtn");
        const errorMessage = $("#errorMessage");

        loginBtn.addClass("loading").text("");
        errorMessage.hide();

        // ✅ must match AuthDTO field names
        const username = $("#username").val();
        const password = $("#password").val();

        $.ajax({
            url: "http://localhost:8080/auth/login",  // ✅ backend URL
            method: "POST",
            contentType: "application/json",
            data: JSON.stringify({ username, password }),
            success: function (response) {
                console.log(response);

                // ✅ extract token from ApiResponse.data
                const token = response.data && response.data.accessToken;

                if (token) {
                    // Save the token
                    localStorage.setItem("jwtToken", token);

                    // Decode token payload (assuming JWT is in standard format header.payload.signature)
                    const payload = JSON.parse(atob(token.split(".")[1]));
                    const userRole = payload.role; // make sure backend includes "role" in JWT

                    // Redirect based on role
                    if (userRole === "ADMIN") {
                        alert("Welcome Admin! Redirecting to Admin Dashboard...");
                        window.location.href = "Admin.html";
                    } else if (userRole === "USER") {
                        alert("Login successful! Redirecting to User Dashboard...");
                        window.location.href = "dashboard.html";
                    } else {
                        alert("Login successful! Redirecting...");
                        window.location.href = "dashboard.html"; // fallback
                    }

                } else {
                    errorMessage.show().text("Login failed: token missing.");
                }

            },
            error: function (xhr) {
                console.error("Login error:", xhr);
                const msg = xhr.responseJSON?.message || "Invalid credentials. Please try again.";
                errorMessage.show().text(msg);
                errorMessage[0].scrollIntoView({ behavior: "smooth", block: "center" });
            },
            complete: function () {
                loginBtn.removeClass("loading").text("Sign In");
            }
        });
    });

    // Social login handlers
    $(".social-btn").on("click", function () {
        const provider = $(this).hasClass("google") ? "Google" : "Facebook";
        alert(`${provider} login functionality would be implemented here`);
    });

    // Input focus animations
    $(".form-input").on("focus", function () {
        $(this).parent().addClass("focused");
    }).on("blur", function () {
        if (!this.value) {
            $(this).parent().removeClass("focused");
        }
    });
});

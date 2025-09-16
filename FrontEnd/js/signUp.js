let selectedUserType = '';

// User type selection
function selectUserType(type) {
    selectedUserType = type;
    document.querySelectorAll('.user-type-card').forEach(card => {
        card.classList.remove('selected');
    });
    document.querySelector(`[data-type="${type}"]`).classList.add('selected');
    validateForm();
}

// Password toggle
function togglePassword(inputId) {
    const passwordInput = document.getElementById(inputId);
    const toggleBtn = passwordInput.nextElementSibling;

    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleBtn.textContent = '🙈';
    } else {
        passwordInput.type = 'password';
        toggleBtn.textContent = '👁️';
    }
}

// Password validation
function validatePassword() {
    const password = document.getElementById('password').value;
    const requirements = {
        length: password.length >= 8,
        uppercase: /[A-Z]/.test(password),
        lowercase: /[a-z]/.test(password),
        number: /\d/.test(password)
    };

    Object.keys(requirements).forEach(key => {
        const element = document.getElementById(key);
        if (requirements[key]) {
            element.classList.add('valid');
            element.classList.remove('invalid');
        } else {
            element.classList.add('invalid');
            element.classList.remove('valid');
        }
    });

    return Object.values(requirements).every(Boolean);
}

// Form validation
function validateForm() {
    const UserName = document.getElementById('UserName').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const terms = document.getElementById('terms').checked;

    const isPasswordValid = validatePassword();
    const doPasswordsMatch = password === confirmPassword;
    const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const isPhoneValid = /^(\+94|0)?[0-9]{9}$/.test(phone.replace(/\s/g, ''));

    const isFormValid = UserName && isEmailValid && isPhoneValid &&
        isPasswordValid && doPasswordsMatch && terms && selectedUserType;

    document.getElementById('signupBtn').disabled = !isFormValid;
    return isFormValid;
}

// Real-time validation
document.getElementById('password').addEventListener('input', validatePassword);
document.querySelectorAll('.form-input, .terms-checkbox').forEach(input => {
    input.addEventListener('input', validateForm);
    input.addEventListener('change', validateForm);
});

// Submit form
document.getElementById('signupForm').addEventListener('submit', function(e) {
    e.preventDefault();

    if (!validateForm()) {
        showError("Please fill all required fields correctly.");
        return;
    }

    const formData = {
        role: selectedUserType,
        username: document.getElementById('UserName').value.trim(),
        email: document.getElementById('email').value.trim(),
        mobile: document.getElementById('phone').value.trim(),
        password: document.getElementById('password').value,
        walletBalance:0.00
    };

    console.log(formData)
    const signupBtn = $("#signupBtn");
    signupBtn.prop("disabled", true).text("Creating...");

    $.ajax({
        url: "http://localhost:8080/auth/register",
        method: "POST",
        contentType: "application/json",
        data: JSON.stringify(formData),
        success: function(response) {
            showSuccess("Account created successfully! Redirecting...");
            setTimeout(() => {
                window.location.href = "login.html";
            }, 1500);
        },
        error: function(xhr) {
            const msg = xhr.responseJSON?.message || "Signup failed. Please try again.";
            showError(msg);
        },
        complete: function() {
            signupBtn.prop("disabled", false).text("Create Account");
        }
    });
});

// Helper functions
function showError(msg) {
    $("#errorMessage").text(msg).fadeIn();
}
function showSuccess(msg) {
    $("#successMessage").text(msg).fadeIn();
}

// Navigation
function showLogin() {
    window.location.href = "login.html";
}

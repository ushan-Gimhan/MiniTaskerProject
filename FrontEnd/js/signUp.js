let selectedUserType = '';

// ------------------- Password toggle -------------------
function togglePassword(inputId) {
    const passwordInput = document.getElementById(inputId);
    if (!passwordInput) return;

    const toggleBtn = passwordInput.nextElementSibling;
    if (!toggleBtn) return;

    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleBtn.textContent = '🙈';
    } else {
        passwordInput.type = 'password';
        toggleBtn.textContent = '👁️';
    }
}

// ------------------- Password validation -------------------
function validatePassword() {
    const passwordInput = document.getElementById('password');
    if (!passwordInput) return false;

    const password = passwordInput.value;
    const requirements = {
        length: password.length >= 8,
        uppercase: /[A-Z]/.test(password),
        lowercase: /[a-z]/.test(password),
        number: /\d/.test(password)
    };

    Object.keys(requirements).forEach(key => {
        const element = document.getElementById(key);
        if (!element) return;

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

// ------------------- Form validation -------------------
function validateForm() {
    const UserName = document.getElementById('UserName')?.value.trim() || '';
    const email = document.getElementById('email')?.value.trim() || '';
    const phone = document.getElementById('phone')?.value.trim() || '';
    const password = document.getElementById('password')?.value || '';
    const confirmPassword = document.getElementById('confirmPassword')?.value || '';
    const terms = document.getElementById('terms')?.checked || false;

    const isPasswordValid = validatePassword();
    const doPasswordsMatch = password === confirmPassword;
    const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const isPhoneValid = /^(\+94|0)?[0-9]{9}$/.test(phone.replace(/\s/g, ''));

    const isFormValid = UserName && isEmailValid && isPhoneValid &&
        isPasswordValid && doPasswordsMatch && terms;

    const signupBtn = document.getElementById('signupBtn');
    if (signupBtn) signupBtn.disabled = !isFormValid;

    return isFormValid;
}

// ------------------- Real-time validation -------------------
document.addEventListener('DOMContentLoaded', () => {
    const passwordInput = document.getElementById('password');
    if (passwordInput) passwordInput.addEventListener('input', validatePassword);

    document.querySelectorAll('.form-input, .terms-checkbox').forEach(input => {
        input.addEventListener('input', validateForm);
        input.addEventListener('change', validateForm);
    });
});

// ------------------- Submit form -------------------
document.getElementById('signupForm')?.addEventListener('submit', function(e) {
    e.preventDefault();

    if (!validateForm()) {
        showError("Please fill all required fields correctly.");
        return;
    }

    const formData = {
        role: "USER",
        username: document.getElementById('UserName')?.value.trim(),
        email: document.getElementById('email')?.value.trim(),
        mobile: document.getElementById('phone')?.value.trim(),
        password: document.getElementById('password')?.value,
        walletBalance: 0.00
    };

    const signupBtn = $("#signupBtn");
    signupBtn.prop("disabled", true).text("Creating...");

    $.ajax({
        url: "http://localhost:8080/auth/register",
        method: "POST",
        contentType: "application/json",
        data: JSON.stringify(formData),
        success: function(response) {
            Swal.fire({
                icon: 'info',
                title: 'Check your email!',
                text: 'A confirmation link has been sent to your email. Please confirm before logging in.',
                timer: 5000,
                timerProgressBar: true,
                toast: true,
                position: 'top-end',
                showConfirmButton: true
            });
            signupBtn.prop("disabled", false).text("Create Account");
            setTimeout(function() {
                window.location.href = "LogIn.html"; // replace with your actual login page path
            }, 1000);
        },
        error: function(xhr) {
            const msg = xhr.responseJSON?.message || "Signup failed. Please try again.";
            console.log(msg);
            showError(msg);

            const usernameInput = document.getElementById('UserName');
            if (usernameInput) {
                if (msg.toLowerCase().includes('username already exists')) {
                    usernameInput.style.border = '2px solid #ef4444';
                    usernameInput.style.backgroundColor = '#fee2e2';
                } else {
                    usernameInput.style.border = '';
                    usernameInput.style.backgroundColor = '';
                }
            }
        },
        complete: function() {
            signupBtn.prop("disabled", false).text("Create Account");
        }
    });
});

// ------------------- SweetAlert2 Helper -------------------
function showError(msg) {
    Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: msg,
        timer: 3000,
        timerProgressBar: true,
        toast: true,
        position: 'top-end',
        showConfirmButton: false
    });
}

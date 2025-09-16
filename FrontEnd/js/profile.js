// === DOM Elements ===
const avatarInput = document.getElementById('avatarInput');
const avatarPreview = document.getElementById('avatarPreview');
const sidebarAvatar = document.getElementById('sidebarAvatar');
const profileForm = document.getElementById('profileForm');
const messageDiv = document.getElementById('message'); // Must exist in HTML
const saveBtn = document.querySelector('.btn-save');
const sidebarName = document.getElementById('sidebarName');
const sidebarUsername = document.getElementById('sidebarUsername');
const sidebarLocation = document.getElementById('sidebarLocation');

// === Global profile object ===
let profileData = {};

// === Helper to safely set textContent ===
function setText(idOrEl, text) {
    const el = typeof idOrEl === 'string' ? document.getElementById(idOrEl) : idOrEl;
    if (el) el.textContent = text || '';
}

// === Show message function ===
function showMessage(text, type) {
    if (!messageDiv) return;
    messageDiv.textContent = text;
    messageDiv.className = `message ${type}`;
    messageDiv.style.display = 'block';
    setTimeout(() => {
        messageDiv.style.display = 'none';
    }, 5000);
}

// === Load user profile from backend ===
function loadUserProfile() {
    const token = localStorage.getItem("jwtToken");
    if (!token) {
        showMessage("Please log in first", "error");
        return;
    }

    fetch("http://localhost:8080/auth/user", {
        method: "GET",
        headers: { "Authorization": `Bearer ${token}` }
    })
        .then(res => {
            if (res.status === 401) throw new Error("Unauthorized: Invalid or expired token");
            if (!res.ok) throw new Error("Failed to fetch profile");
            return res.json();
        })
        .then(user => {
            profileData = user;

            // === Fill User info ===
            setText('fullName', user.fullName);
            setText('email1' , user.email);
            document.getElementById('fullName').value = user.fullName || '';
            document.getElementById('username').value = user.username || '';
            document.getElementById('email1').value = user.email || '';

            if (user.profile) {
                document.getElementById('location').value = user.profile.location || '';
                document.getElementById('bio').value = user.profile.bio || '';

                if (user.profile.avatar) {
                    if (avatarPreview) avatarPreview.style.backgroundImage = `url(${user.profile.avatar})`;
                    if (sidebarAvatar) sidebarAvatar.src = user.profile.avatar;
                    profileData.avatar = user.profile.avatar;
                }
            }

            // === Update Sidebar ===
            setText(sidebarName, user.fullName);
            setText(sidebarUsername, user.username ? `@${user.username}` : '');
            setText(sidebarLocation, user.profile?.location);
        })
        .catch(err => {
            console.error("Profile fetch error:", err);
            showMessage(err.message, "error");
        });
}

// === Avatar click to open file input ===
if (avatarPreview && avatarInput) {
    avatarPreview.addEventListener('click', () => avatarInput.click());
    avatarInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            showMessage("Please select a valid image file", "error");
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            showMessage("File size must be less than 5MB", "error");
            return;
        }

        const reader = new FileReader();
        reader.onload = function(e) {
            const imageUrl = e.target.result;
            profileData.avatar = imageUrl;
            avatarPreview.style.backgroundImage = `url(${imageUrl})`;
            if (sidebarAvatar) sidebarAvatar.src = imageUrl;
        };
        reader.readAsDataURL(file);
    });
}

// === Handle form submission ===
if (profileForm) {
    profileForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const token = localStorage.getItem("jwtToken");
        if (!token) {
            showMessage("Please log in first", "error");
            return;
        }

        if (saveBtn) {
            saveBtn.classList.add('loading');
            saveBtn.textContent = '';
        }

        const updatedProfile = {
            fullName: document.getElementById('fullName').value,
            email: document.getElementById('email').value,
            location: document.getElementById('location').value,
            bio: document.getElementById('bio').value,
            avatar: profileData.avatar || null
        };

        fetch("http://localhost:8080/auth/update", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(updatedProfile)
        })
            .then(res => {
                if (res.status === 401) throw new Error("Unauthorized: Invalid or expired token");
                if (!res.ok) throw new Error("Update failed");
                return res.json();
            })
            .then(data => {
                profileData = data;
                showMessage("Profile updated successfully!", "success");

                // Update sidebar
                setText(sidebarName, data.fullName);
                setText(sidebarLocation, data.location);

                // Reset input borders to default (white)
                profileForm.querySelectorAll('input, textarea').forEach(input => {
                    input.style.borderColor = '';
                    input.style.boxShadow = '';
                });
            })
            .catch(err => {
                console.error("Profile update error:", err);
                showMessage(err.message, "error");
            })
            .finally(() => {
                if (saveBtn) {
                    saveBtn.classList.remove('loading');
                    saveBtn.textContent = 'Save Changes';
                }
            });
    });
}

// === Initialize on page load ===
window.addEventListener('DOMContentLoaded', loadUserProfile);

// === DOM Elements ===
const avatarInput = $('#avatarInput');
const avatarPreview = $('#avatarPreview');
const sidebarAvatar = $('#sidebarAvatar');
const profileForm = $('#profileForm');
const messageDiv = $('#message'); // Must exist in HTML
const saveBtn = $('.btn-save');
const sidebarName = $('#sidebarName');
const sidebarUsername = $('#sidebarUsername');
const sidebarLocation = $('#sidebarLocation');

let profileData = {}; // Store profile & user info locally

// === Show message function ===
function showMessage(text, type) {
    if (!messageDiv.length) return;
    messageDiv.text(text).removeClass().addClass(`message ${type}`).fadeIn();
    setTimeout(() => messageDiv.fadeOut(), 5000);
}

// === Load User Profile ===
function loadUserProfile() {
    const token = localStorage.getItem("jwtToken");
    if (!token) {
        showMessage("Please log in first", "error");
        return;
    }

    // Step 1: Get logged-in user
    $.ajax({
        url: "http://localhost:8080/auth/user",
        method: "GET",
        headers: { "Authorization": `Bearer ${token}` },
        success: function(user) {
            profileData.userId = user.id;
            profileData.username = user.username;

            sidebarUsername.text(user.username ? `@${user.username}` : '');

            // Step 2: Fetch profile by userId
            $.ajax({
                url: `http://localhost:8080/profile/get/${user.id}`,
                method: "GET",
                headers: { "Authorization": `Bearer ${token}` },
                success: function(profile) {
                    if (profile) {
                        profileData.profile = profile;

                        $('#fullName').val(profile.fullName || '');
                        $('#username').val(user.username || '');
                        $('#email1').val(user.email || '');
                        $('#Number').val(user.mobile || '');
                        $('#location').val(profile.location || '');
                        $('#bio').val(profile.bio || '');

                        if (profile.avatarUrl) {
                            // Set the div preview background (remove placeholder text 👤)
                            avatarPreview.css({
                                'background-image': `url(${profile.avatarUrl})`,
                                'background-size': 'cover',
                                'background-position': 'center',
                                'background-repeat': 'no-repeat'
                            }).text(''); // remove the placeholder text

                            // Also update the sidebar image
                            sidebarAvatar.attr('src', profile.avatarUrl);

                            // Save avatar URL in profileData for future updates
                            profileData.avatar = profile.avatarUrl;
                        } else {
                            // If no avatar, show default placeholder
                            avatarPreview.css('background-image', 'none').text('👤');
                            sidebarAvatar.attr('src', 'default-avatar.png'); // optional default
                        }
                        sidebarLocation.text(profile.location || '');
                    } else {
                        showMessage("No profile found. You can create one.", "info");
                        $('#fullName').val(user.fullName || '');
                        $('#username').val(user.username || '');
                        $('#email').val(user.email || '');
                    }
                },
                error: function(err) {
                    console.error("Profile fetch error:", err);
                    showMessage("Failed to fetch profile", "error");
                }
            });
        },
        error: function(err) {
            console.error("User fetch error:", err);
            showMessage("Failed to get user info", "error");
        }
    });
}

// === Avatar change preview ===
if (avatarPreview.length && avatarInput.length) {
    avatarPreview.on('click', () => avatarInput.click());

    avatarInput.on('change', function() {
        const file = this.files[0];
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
            profileData.avatarFile = file; // store file for uploading
            avatarPreview.css('background-image', `url(${e.target.result})`);
            sidebarAvatar.attr('src', e.target.result);
        };
        reader.readAsDataURL(file);
    });
}

// === Upload image to ImgBB using fetch ===
async function uploadAvatarToImgBB(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = async function(e) {
            const base64 = e.target.result.split(',')[1];
            const formData = new FormData();
            formData.append("image", base64);

            const imgbbApiKey = "b56b8866f0ddb6ccb4adcf435a94347b";

            try {
                const response = await fetch(`https://api.imgbb.com/1/upload?key=${imgbbApiKey}`, {
                    method: "POST",
                    body: formData
                });

                const data = await response.json();
                if (data.success && data.data && data.data.url) {
                    resolve(data.data.url); // ✅ Uploaded image URL
                } else {
                    reject(new Error("ImgBB upload failed"));
                }
            } catch (err) {
                reject(err);
            }
        };

        reader.readAsDataURL(file);
    });
}

// === Handle form submit (Create or Update) ===
if (profileForm.length) {
    profileForm.on('submit', async function(e) {
        e.preventDefault();
        const token = localStorage.getItem("jwtToken");
        if (!token) {
            showMessage("Please log in first", "error");
            return;
        }

        saveBtn.prop('disabled', true).text('Saving...');

        try {
            let avatarUrl = profileData.avatar || null;

            if (profileData.avatarFile) {
                try {
                    avatarUrl = await uploadAvatarToImgBB(profileData.avatarFile);
                    console.log("Uploaded avatar URL:", avatarUrl);
                } catch(err) {
                    console.error("ImgBB upload failed", err);
                    showMessage("Failed to upload avatar", "error");
                }
            }

            const updatedProfile = {
                userId: profileData.userId,
                fullName: $('#fullName').val(),
                email: $('#email').val(),
                location: $('#location').val(),
                bio: $('#bio').val(),
                avatarUrl: avatarUrl
            };

            const endpoint = profileData.profile ? "update" : "create";

            $.ajax({
                url: `http://localhost:8080/profile/${endpoint}`,
                method: "POST",
                headers: { "Authorization": `Bearer ${token}` },
                contentType: "application/json",
                data: JSON.stringify(updatedProfile),
                success: function(data) {
                    profileData.profile = data;
                    profileData.avatar = data.avatar;

                    showMessage(`Profile ${endpoint}d successfully!`, "success");

                    // Update sidebar
                    sidebarName.text(data.fullName);
                    sidebarLocation.text(data.location);
                    if (data.avatar) sidebarAvatar.attr('src', data.avatar);

                    // Reset input borders
                    profileForm.find('input, textarea').css({ borderColor: '', boxShadow: '' });
                },
                error: function(xhr) {
                    console.error("Profile save error:", xhr);
                    showMessage("Failed to save profile", "error");
                },
                complete: function() {
                    saveBtn.prop('disabled', false).text('Save Changes');
                    profileData.avatarFile = null;
                }
            });
        } catch (err) {
            console.error("Form submit error:", err);
            showMessage("Failed to save profile", "error");
            saveBtn.prop('disabled', false).text('Save Changes');
        }
    });
}

// === Initialize ===
$(document).ready(loadUserProfile);

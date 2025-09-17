// --------------------- Load User Profile ---------------------
window.addEventListener('load', async function () {
    const token = localStorage.getItem('jwtToken');

    if (!token) {
        console.warn("No JWT token found. Showing Guest header.");
        updateHeader("Guest");
        return;
    }

    try {
        const user = await loadUserDetails(token);
        console.log("Logged in user:", user);

        // --- Header Updates ---
        const headerUsernameEl = document.getElementById("headerUsername");
        const avatarEl = document.getElementById("userAvatar");
        const notifBadge = document.querySelector(".notification-badge");

        if (headerUsernameEl) headerUsernameEl.textContent = `Welcome, ${user.name || user.username}!`;
        if (avatarEl) avatarEl.textContent = (user.name || user.username).charAt(0).toUpperCase();
        if (notifBadge) notifBadge.textContent = user.notifications ?? 0;

        // --- Sidebar Updates ---
        const profileImage = document.querySelector(".profile img");
        const sidebarName = document.querySelector(".profile-info h3");
        const sidebarBalance = document.querySelector(".profile-info .balance");
        const sidebarUsername = document.querySelector(".profile-info .username");

        if (profileImage) profileImage.src = user.profileImage || "https://via.placeholder.com/100";
        if (sidebarName) sidebarName.textContent = user.name || user.username;
        if (sidebarBalance) sidebarBalance.textContent = `Balance: $${(user.balance ?? 0).toFixed(2)} USD`;
        if (sidebarUsername) sidebarUsername.textContent = `@${user.username}`;

    } catch (err) {
        console.error("Error initializing dashboard:", err);
        updateHeader("Guest");
        localStorage.removeItem('jwtToken');
    }
});

// --------------------- Load User Details (AJAX) ---------------------
async function loadUserDetails(token) {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: "http://localhost:8080/auth/user",
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            success: function (user) {
                if (!user || !user.username) reject(new Error("Invalid user data from server"));
                else resolve(user);
            },
            error: function (xhr, status, error) {
                console.error("loadUserDetails error:", status, error, xhr.responseText);
                reject(new Error(`Failed to fetch user details (status ${xhr.status})`));
            }
        });
    });
}
async function loadSidebarProfile() {
    const token = localStorage.getItem("jwtToken");
    if (!token) return;

    try {
        // Step 1: Get user
        const user = await loadUserDetails(token);

        // Step 2: Get profile by userId
        $.ajax({
            url: `http://localhost:8080/profile/get/${user.id}`,
            method: "GET",
            headers: { "Authorization": `Bearer ${token}` },
            success: function(profile) {
                const sidebarProfile = $(".sidebar .profile");
                if (!sidebarProfile.length) return;

                // Set values with fallbacks
                const avatarUrl = profile && profile.avatarUrl ? profile.avatarUrl : "https://via.placeholder.com/100";
                const username = user.username ? `@${user.username}` : "@user";
                const balance = user.walletBalance;

                sidebarProfile.find("img").attr("src", avatarUrl);
                sidebarProfile.find(".balance").text(`Balance: $${balance} USD`);
                sidebarProfile.find(".username").text(username);
            },
            error: function(err) {
                console.error("Failed to fetch profile:", err);
            }
        });
    } catch (err) {
        console.error("Failed to load user details:", err);
    }
}

// Call it
loadSidebarProfile();

// --------------------- Header Fallback ---------------------
// function updateHeader(username) {
//     const headerEl = document.getElementById("headerUsername");
//     if (headerEl) headerEl.textContent = `Welcome, ${username}!`;
// }

// --------------------- Budget Calculation ---------------------
const quantityInput = document.getElementById("quantity");
const workerEarnInput = document.getElementById("workerEarn");
const totalBudgetInput = document.getElementById("totalBudget");

function updateBudget() {
    const qty = parseFloat(quantityInput?.value) || 0;
    const earn = parseFloat(workerEarnInput?.value) || 0;
    const total = (qty * earn).toFixed(2);
    if (totalBudgetInput) totalBudgetInput.value = total > 0 ? `$${total} USD` : "";
    if (totalBudgetInput) {
        totalBudgetInput.style.transform = 'scale(1.05)';
        setTimeout(() => totalBudgetInput.style.transform = 'scale(1)', 200);
    }
}

quantityInput?.addEventListener("input", updateBudget);
workerEarnInput?.addEventListener("input", updateBudget);
updateBudget();

// --------------------- Message Display ---------------------
const messageArea = document.getElementById("messageArea");
function showMessage(message, type = 'success') {
    messageArea.innerHTML = `<div class="message ${type}" style="display:block;">${message}</div>`;
    setTimeout(() => messageArea.innerHTML = '', 2500);
}

// --------------------- Convert Image to Base64 ---------------------
function getBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result.split(',')[1]);
        reader.onerror = error => reject(error);
        reader.readAsDataURL(file);
    });
}

// --------------------- Form Submission ---------------------
$("#jobForm").on("submit", async function (e) {
    e.preventDefault();
    const token = localStorage.getItem("jwtToken");
    const submitBtn = document.getElementById("submitBtn");
    if (!submitBtn) return;

    submitBtn.disabled = true;
    submitBtn.textContent = "Creating Job...";
    submitBtn.classList.add('loading');

    try {
        const jobImageFile = $("#jobImage")[0]?.files[0];
        let uploadedImageUrl = null;
        let base64Image = null;
        let originalImageName = null;
        const user = await loadUserDetails(token);

        // -------- Upload Image --------
        if (jobImageFile) {
            originalImageName = jobImageFile.name;
            base64Image = await getBase64(jobImageFile);

            const formData = new FormData();
            formData.append("image", base64Image);

            const imgbbApiKey = "b56b8866f0ddb6ccb4adcf435a94347b"; // replace with your key
            const imgbbResponse = await fetch(`https://api.imgbb.com/1/upload?key=${imgbbApiKey}`, {
                method: "POST",
                body: formData
            });

            const imgbbData = await imgbbResponse.json();
            if (imgbbData.success) uploadedImageUrl = imgbbData.data.url;
            else throw new Error("Image upload failed");
        }

        // -------- Prepare Task Data --------
        const taskData = {
            title: $("#title").val()?.trim(),
            description: $("#description").val()?.trim(),
            rewardPerTask: parseFloat($("#workerEarn").val()) || 0,
            totalQuantity: parseInt($("#quantity").val()) || 0,
            availableQuantity: parseInt($("#quantity").val()) || 0,
            imageName: uploadedImageUrl,
            imageBase64: base64Image,
            originalImageName: originalImageName,
            status: "ACTIVE",
            totalPrice: (parseFloat($("#workerEarn").val()) || 0) * (parseInt($("#quantity").val()) || 0),
            client: user
        };

        // -------- Send Task to Backend --------
        const response = await fetch("http://localhost:8080/task/create", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...(token && { "Authorization": `Bearer ${token}` })
            },
            body: JSON.stringify(taskData)
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Request failed with status ${response.status}`);
        }

        const data = await response.json();
        showMessage("✅ Job created successfully!", 'success');
        alert("✅ Top-up saved successfully!");
        console.log("Response:", data);

        // Reset form
        $("#jobForm")[0].reset();

// ✅ Reset input styles
        $("#jobForm input, #jobForm select, #jobForm textarea").css({
            borderColor: "",
            boxShadow: ""
        });
        totalBudgetInput.value = "";
        setTimeout(updateBudget);

    } catch (err) {
        showMessage(`❌ Error creating job: ${err.message}`, 'error');
        console.error(err);
    } finally {
        submitBtn.classList.remove('loading');
        submitBtn.textContent = 'Create Job';
        submitBtn.disabled = false;
    }
});

// --------------------- Form Validation & Animation ---------------------
$("input[required], select[required]").on("blur focus", function (e) {
    const hasValue = this.value;
    $(this).css({
        borderColor: e.type === "focus" ? '#fbbf24' : hasValue ? '#10b981' : '#ef4444',
        boxShadow: e.type === "focus"
            ? '0 0 0 4px rgba(251, 191, 36, 0.15)'
            : hasValue
                ? '0 0 0 3px rgba(16, 185, 129, 0.1)'
                : '0 0 0 3px rgba(239, 68, 68, 0.1)'
    });
});

$(".form-group").each(function (index) {
    $(this).css({ opacity: 0, transform: 'translateY(20px)' });
    setTimeout(() => {
        $(this).css({ transition: 'opacity 0.6s ease, transform 0.6s ease', opacity: 1, transform: 'translateY(0)' });
    }, index * 100);
});

// --------------------- Load User Profile ---------------------
window.addEventListener('load', async function () {
    const token = localStorage.getItem('jwtToken');

    if (!token) {
        // no token → redirect to login
        window.location.href = "login.html";
        return;
    }
    try {
        const user = await loadUserDetails(token);


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
        if (sidebarBalance) sidebarBalance.textContent = `Balance: $${(user.walletBalance ?? 0).toFixed(2)} USD`;
        if (sidebarUsername) sidebarUsername.textContent = `User Name:${user.username}`;

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


quantityInput?.addEventListener("input", updateBudget);
workerEarnInput?.addEventListener("input", updateBudget);
updateBudget();

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

    const requiredFields = ["#title", "#description", "#workerEarn", "#quantity"];
    for (let field of requiredFields) {
        if (!$(field).val()?.trim()) {
            alert("Please fill all required fields!");
            return;
        }
    }

    try {
        const jobImageFile = $("#jobImage")[0]?.files[0];
        let base64Image = null;
        let originalImageName = null;

        if (jobImageFile) {
            originalImageName = jobImageFile.name;
            base64Image = await getBase64(jobImageFile);

        }
        const token = localStorage.getItem('jwtToken');
        const user = await loadUserDetails(token);

        const taskData = {
            title: $("#title").val()?.trim(),
            description: $("#description").val()?.trim(),
            rewardPerTask: parseFloat($("#workerEarn").val()) || 0,
            totalQuantity: parseInt($("#quantity").val()) || 0,
            availableQuantity: parseInt($("#quantity").val()) || 0,
            imageBase64: base64Image,
            originalImageName: originalImageName,
            status: "PENDING",
            totalPrice: (parseFloat($("#workerEarn").val()) || 0) * (parseInt($("#quantity").val()) || 0),
            client:user
        };

        // Save in sessionStorage for payment page
        sessionStorage.setItem("pendingJobData", JSON.stringify(taskData));

        // Redirect to payment page
        window.location.href = "n.html";

    } catch (err) {
        console.error("❌ Error preparing job:", err);
        alert("Error: " + err.message);
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

// ------------------- Get current logged-in user -------------------
async function getCurrentUser() {
    try {
        const token = localStorage.getItem("jwtToken");
        if (!token) throw new Error("No token found");

        const res = await fetch("http://localhost:8080/auth/user", {
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (!res.ok) throw new Error("Failed to fetch user");

        return await res.json();
    } catch (err) {
        console.error("Error fetching current user:", err);
        return null;
    }
}

// ------------------- Load user notifications with sequential animation -------------------
async function loadUserNotifications() {
    const container = document.querySelector("#taskMain");
    const spinner = document.getElementById("loadingSpinner");
    const emptyState = document.getElementById("emptyState");

    if (!container) return console.error("Notifications container not found!");

    try {
        // Show loading state
        spinner.style.display = 'block';
        container.innerHTML = "";
        container.style.display = 'flex';
        emptyState.style.display = 'none';

        const user = await getCurrentUser();
        if (!user) return showEmptyState("Please log in to view notifications");

        const token = localStorage.getItem("jwtToken");
        const res = await fetch(`http://localhost:8080/notify/user/${user.id}`, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });
        if (!res.ok) throw new Error("Failed to fetch notifications");


        const responseData = await res.json();
        const notifications = responseData.data || [];

        if (!notifications.length) return showEmptyState("No notifications found");

        // Append notifications one by one with animation
        for (let i = 0; i < notifications.length; i++) {
            const notif = notifications[i];
            const element = createNotificationElement(notif);
            container.appendChild(element);

            await new Promise(resolve => setTimeout(resolve, 200)); // stagger delay
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        }

    } catch (err) {
        console.error("Error loading notifications:", err);
        showEmptyState("Error loading notifications");
    } finally {
        spinner.style.display = 'none';
    }
}

// ------------------- Create notification element -------------------
function createNotificationElement(notif) {
    let icon = "ℹ️", bg = "#e5e7eb", color = "#64748b";
    const msg = notif.message || "";

    if (msg.toLowerCase().includes("approved")) {
        icon = "✅"; bg = "#fef3c7"; color = "#fbbf24";
    } else if (msg.toLowerCase().includes("payment")) {
        icon = "💰"; bg = "rgba(16,185,129,0.2)"; color = "#10b981";
    } else if (msg.toLowerCase().includes("rejected")) {
        icon = "❌"; bg = "rgba(239,68,68,0.2)"; color = "#ef4444";
    } else if (msg.toLowerCase().includes("bonus")) {
        icon = "🎁"; bg = "rgba(59,130,246,0.2)"; color = "#3b82f6";
    }

    const timeText = notif.timestamp ? timeAgo(notif.timestamp) : "Just now";

    const div = document.createElement('div');
    div.className = 'task-item glass';
    div.style.opacity = '0';
    div.style.transform = 'translateY(10px)';
    div.style.transition = 'all 0.4s ease';

    div.innerHTML = `
        <div class="task-info" style="display:flex; align-items:flex-start; gap:1rem;">
            <div class="avatar-preview glass" style="width:40px; height:40px; display:flex; align-items:center; justify-content:center; border-radius:50%; flex-shrink:0; background:${bg}; color:${color};">
                ${icon}
            </div>
            <div>
                <p class="task-title">${msg.split(".")[0]}</p>
                <p class="task-client">${msg}</p>
            </div>
        </div>
        <div class="task-rewards" style="flex-shrink:0;">
            <span class="status-badge status-completed">${timeText}</span>
        </div>
    `;
    return div;
}

// ------------------- Show empty state -------------------
function showEmptyState(message) {
    const container = document.querySelector("#taskMain");
    const emptyState = document.getElementById("emptyState");

    container.style.display = 'none';
    emptyState.style.display = 'block';
    emptyState.textContent = message;
}

// ------------------- Convert timestamp to "time ago" -------------------
function timeAgo(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);

    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
}

// ------------------- Auto-load notifications on page load -------------------
window.addEventListener("DOMContentLoaded", loadUserNotifications);



// ------------------- Get current logged-in user -------------------
async function getCurrentUser() {
    try {
        const token = localStorage.getItem("jwtToken");
        if (!token) throw new Error("No token found");

        const res = await fetch("http://localhost:8080/auth/user", {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        if (!res.ok) throw new Error("Failed to fetch user");

        const userData = await res.json();
        return userData;
    } catch (err) {
        console.error("Error fetching current user:", err);
        return null;
    }
}

// ------------------- Load user notifications with sequential animation -------------------
async function loadUserNotifications() {
    const container = document.querySelector("#taskMain");
    const spinner = document.getElementById("loadingSpinner");
    const loadBtn = document.querySelector(".load-btn");
    const clearBtn = document.getElementById("clearBtn");
    const emptyState = document.getElementById("emptyState");

    if (!container) {
        console.error("Notifications container not found!");
        return;
    }

    try {
        // Show loading state
        loadBtn.disabled = true;
        loadBtn.textContent = 'Loading...';
        spinner.style.display = 'block';
        container.innerHTML = "";
        clearBtn.style.display = 'none';
        emptyState.style.display = 'none';

        const user = await getCurrentUser();
        if (!user) {
            showEmptyState("Please log in to view notifications");
            return;
        }

        const res = await fetch(`http://localhost:8080/notify/user/${user.id}`);

        if (!res.ok) throw new Error("Failed to fetch notifications");

        const responseData = await res.json();
        const notifications = responseData.data || [];

        if (notifications.length === 0) {
            showEmptyState("No notifications found");
            return;
        }

        // Load notifications one by one with animation
        for (let i = 0; i < notifications.length; i++) {
            await new Promise(resolve => setTimeout(resolve, 600)); // 600ms delay

            const notif = notifications[i];
            const notificationElement = createNotificationElement(notif);

            container.appendChild(notificationElement);

            // Trigger show animation
            setTimeout(() => {
                notificationElement.classList.add('show');
            }, 50);
        }

        clearBtn.style.display = 'inline-block';

    } catch (err) {
        console.error("Error loading notifications:", err);
        showEmptyState("Error loading notifications");
    } finally {
        // Hide loading state
        setTimeout(() => {
            spinner.style.display = 'none';
            loadBtn.disabled = false;
            loadBtn.textContent = 'Load Notifications';
        }, 500);
    }
}

function createNotificationElement(notif) {
    // Determine icon, background, and color
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

function showEmptyState(message) {
    const container = document.querySelector("#taskMain");
    const emptyState = document.getElementById("emptyState");

    container.style.display = 'none';
    emptyState.style.display = 'block';
    emptyState.querySelector('p').textContent = message;
}

function clearNotifications() {
    const notifications = document.querySelectorAll('.task-item');
    const clearBtn = document.getElementById('clearBtn');

    notifications.forEach((notification, index) => {
        setTimeout(() => {
            notification.style.transform = 'translateX(100%) scale(0.8)';
            notification.style.opacity = '0';
        }, index * 100);
    });

    setTimeout(() => {
        document.getElementById('taskMain').innerHTML = '';
        clearBtn.style.display = 'none';
    }, notifications.length * 100 + 300);
}

// ------------------- Helper function to convert timestamp to "time ago" -------------------
function timeAgo(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);

    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
}

// Auto-load notifications when section is viewed (optional)
// Uncomment the line below if you want auto-loading
// window.addEventListener("load", () => setTimeout(loadUserNotifications, 1000));

// Demo function to show the animation with static data
function demonstrateAnimation() {
    const notifications = document.querySelectorAll('.task-item');

    // Hide all notifications first
    notifications.forEach(notif => {
        notif.style.opacity = '0';
        notif.style.transform = 'translateY(10px)';
    });

    // Show them one by one
    notifications.forEach((notif, index) => {
        setTimeout(() => {
            notif.classList.add('show');
        }, index * 600);
    });

    // Show clear button after all animations
    setTimeout(() => {
        document.getElementById('clearBtn').style.display = 'inline-block';
    }, notifications.length * 600 + 500);
}

// Auto-demonstrate the animation on page load
window.addEventListener("load", () => {
    setTimeout(demonstrateAnimation, 1000);
});
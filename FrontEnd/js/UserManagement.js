// --------------------- On Page Load ---------------------
window.addEventListener('load', async function () {
    const token = localStorage.getItem('jwtToken');
    if (!token) {
        // no token → redirect to login
        window.location.href = "login.html";
        return;
    }

    if (!token) {
        console.warn("No JWT token found. Redirecting to login...");
        window.location.href = "login.html";
        return;
    }

    try {
        await loadUsers(token);
        console.log("✅ User management data loaded");
    } catch (err) {
        console.error("❌ Error loading user management data:", err);
    }
});

// // --------------------- Load User Statistics ---------------------
// async function loadUserStatistics(token) {
//     try {
//         const res = await fetch("http://localhost:8080/admin/userStatistics", {
//             method: "GET",
//             headers: {
//                 "Authorization": `Bearer ${token}`,
//                 "Content-Type": "application/json"
//             }
//         });
//
//         if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
//
//         const stats = await res.json();
//
//         document.querySelectorAll(".stat-card").forEach(card => {
//             const title = card.querySelector(".title").textContent.toLowerCase();
//             if (title.includes("total users")) card.querySelector(".value").textContent = stats.totalUsers || 0;
//             if (title.includes("active users")) card.querySelector(".value").textContent = stats.activeUsers || 0;
//             if (title.includes("suspended")) card.querySelector(".value").textContent = stats.suspendedUsers || 0;
//             if (title.includes("new signups")) card.querySelector(".value").textContent = stats.newSignups || 0;
//         });
//     } catch (err) {
//         console.error("Failed to load user statistics:", err);
//     }
// }

// --------------------- Load Users List ---------------------
async function loadUsers(token) {
    try {
        const res = await fetch("http://localhost:8080/auth/users", { // updated endpoint
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

        const apiResponse = await res.json();
        const users = apiResponse.data || []; // <-- access the data field
        const tbody = document.querySelector("section table tbody");
        tbody.innerHTML = "";

        if (!Array.isArray(users) || users.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" class="text-center text-stone-500 dark:text-stone-400">No users found</td></tr>`;
            return;
        }

        users.forEach(user => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${user.username}</td>
                <td>${user.email}</td>
                <td>${user.role || ''}</td>
                <td><span class="status-badge ${user.status?.toLowerCase() || 'active'}">${user.status || 'Active'}</span></td>
                <td class="action-buttons">
                    <button><i class="fas fa-eye"></i></button>
                    <button><i class="fas fa-edit"></i></button>
                    <button class="delete-btn"><i class="fas fa-user-slash"></i></button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (err) {
        console.error("Failed to load users:", err);
    }
}

// --------------------- Search Users ---------------------
document.querySelector("input[type=text]").addEventListener("input", function () {
    const searchTerm = this.value.toLowerCase();
    document.querySelectorAll("section table tbody tr").forEach(row => {
        const name = row.querySelector("td div")?.textContent.toLowerCase() || "";
        const email = row.querySelector("td:nth-child(2)")?.textContent.toLowerCase() || "";
        row.style.display = name.includes(searchTerm) || email.includes(searchTerm) ? "" : "none";
    });
});

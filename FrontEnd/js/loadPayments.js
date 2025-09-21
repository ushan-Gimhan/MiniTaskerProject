// ============================
// API URLs
// ============================
const paymentsApiURL = "http://localhost:8080/payment";
const authApiURL = "http://localhost:8080/auth/user"; // ✅ Adjust if different


// ============================
// Get User by JWT Token
// ============================
async function loadUserByToken() {
    const token = localStorage.getItem("jwtToken");
    if (!token) {
        console.warn("⚠️ No token found!");
        return null;
    }

    try {
        const res = await fetch(authApiURL, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        if (!res.ok) throw new Error("Failed to fetch user from token");

        return await res.json(); // { id, username, email, ... }
    } catch (err) {
        console.error("❌ User load error:", err);
        return null;
    }
}


// ============================
// Load All Payments
// ============================
async function loadPayments() {
    try {
        // 1️⃣ Get current logged-in user
        const currentUser = await loadUserByToken();

        // 2️⃣ Get all payments
        const res = await fetch(paymentsApiURL + "/getAll");
        const data = await res.json();

        // 3️⃣ Unwrap data safely
        const payments = Array.isArray(data) ? data : (data.data || []);

        // 4️⃣ Render into table
        const tbody = document.getElementById("tblPaymentsBody");
        tbody.innerHTML = ""; // reset table

        payments.forEach(payment => {
            const username = payment.user?.username || currentUser?.username || "Unknown";
            const userId = payment.user?.id || currentUser?.id || "N/A";

            const row = document.createElement("tr");
            row.innerHTML = `
                <td>
                    <div style="display:flex; align-items:center;">       
                        ${username} (ID: ${userId})
                    </div>
                </td>
                <td>$${Number(payment.amount).toFixed(2)}</td>
                <td>${payment.method || "N/A"}</td>
                <td>${payment.date ? new Date(payment.date).toLocaleString() : "N/A"}</td>
                <td class="action-buttons">
                    <button onclick="viewPayment(${payment.id})"><i class="fas fa-eye"></i></button>
                    <button onclick="deletePayment(${payment.id})"><i class="fas fa-trash"></i></button>
                </td>
            `;
            tbody.appendChild(row);
        });
    } catch (err) {
        console.error("❌ Error loading payments:", err);
    }
}


// ============================
// View Payment
// ============================
function viewPayment(id) {
    alert("👁️ Viewing payment ID: " + id);
    // 🔜 Later: Load details into modal
}


// ============================
// Delete Payment
// ============================
async function deletePayment(id) {
    if (!confirm("⚠️ Are you sure you want to delete this payment?")) return;

    try {
        const res = await fetch(paymentsApiURL + "/delete/" + id, { method: "DELETE" });

        if (!res.ok) throw new Error("Failed to delete payment");

        alert("✅ Payment deleted successfully!");
        loadPayments(); // refresh table
    } catch (err) {
        console.error("❌ Delete error:", err);
        alert("❌ Failed to delete payment");
    }
}


// ============================
// Button Event Listeners
// ============================
document.getElementById("btnRefreshPayments").addEventListener("click", loadPayments);

// ============================
// Auto-load Payments on Page Load
// ============================
window.addEventListener("load", loadPayments);

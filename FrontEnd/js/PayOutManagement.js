// --------------------- On Page Load ---------------------
window.addEventListener('load', async function () {
    const token = localStorage.getItem('jwtToken');
    if (!token) {
        // No token → redirect to login
        window.location.href = "login.html";
        return;
    }

    try {
        await loadPayouts(token);
        console.log("✅ Payouts data loaded");
    } catch (err) {
        console.error("❌ Error loading payouts data:", err);
    }
});

// --------------------- Load Payouts List ---------------------
async function loadPayouts(token) {
    try {
        const res = await fetch("http://localhost:8080/payouts/getAll", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

        const payouts = await res.json();
        const tbody = document.querySelector("#payoutsTableBody");
        tbody.innerHTML = "";

        if (!Array.isArray(payouts) || payouts.length === 0) {
            tbody.innerHTML = `<tr>
                <td colspan="7" style="
                    text-align: center; 
                    color: #9ca3af; 
                    padding: 2rem;
                    background-color: #1f2937;
                    border: 1px solid #374151;
                    font-style: italic;
                ">No payouts found</td>
            </tr>`;
            return;
        }

        payouts.forEach(payout => {
            const tr = document.createElement("tr");
            tr.style.cssText = `
                background-color: #1f2937;
                border-bottom: 1px solid #374151;
                transition: all 0.3s ease;
            `;

            // Hover effect
            tr.addEventListener('mouseenter', () => tr.style.backgroundColor = '#374151');
            tr.addEventListener('mouseleave', () => tr.style.backgroundColor = '#1f2937');

            // Status color function
            function getStatusColor(status) {
                if (status === "PENDING") return "#f59e0b";
                if (status === "APPROVED") return "#10b981";
                if (status === "REJECTED") return "#ef4444";
                return "#d1d5db";
            }

            // Build table row
            tr.innerHTML = `
                <td style="padding:0.75rem; border:1px solid #374151; color:#f3f4f6; font-weight:500;">
                    ${payout.user?.username || payout.accountHolderName || 'Unknown User'}
                    ${payout.user?.email ? ` (${payout.user.email})` : ''}
                </td>
                <td style="padding:0.75rem; border:1px solid #374151; color:#d1d5db;">
                    $${payout.amount?.toFixed(2) || 0}
                </td>
                <td class="status-cell" style="padding:0.75rem; border:1px solid #374151; color:${getStatusColor(payout.status)};">
                    ${payout.status || 'Unknown'}
                </td>
                <td style="padding:0.75rem; border:1px solid #374151; color:#d1d5db;">
                    ${payout.bankName || '-'}
                </td>
                <td style="padding:0.75rem; border:1px solid #374151; color:#d1d5db;">
                    ${payout.accountHolderName || '-'}
                </td>
                <td style="padding:0.75rem; border:1px solid #374151; color:#d1d5db;">
                    ${payout.accountNumber || '-'}
                </td>
                <td style="padding:0.75rem; border:1px solid #374151;">
                    ${payout.status === "PENDING" ? `<button class="update-btn" style="
                        background: linear-gradient(135deg, #1173d4 0%, #0ea5e9 100%);
                        color:white; border:none; padding:0.5rem 1rem; border-radius:0.5rem;
                        cursor:pointer; font-weight:500; font-size:0.875rem;">Update</button>` : ''}
                </td>
            `;

            tbody.appendChild(tr);

            // --------------------- Update Button ---------------------
            const updateBtn = tr.querySelector(".update-btn");
            if (updateBtn) {
                updateBtn.addEventListener("click", () => {
                    const statusCell = tr.querySelector(".status-cell");
                    const currentStatus = payout.status || "PENDING";

                    statusCell.innerHTML = `
                        <select style="
                            width:100%; padding:0.5rem; background-color:#374151; color:#f3f4f6;
                            border:1px solid #4b5563; border-radius:0.5rem; font-size:0.875rem; outline:none;
                            cursor:pointer;">
                            <option value="PENDING" ${currentStatus === 'PENDING' ? 'selected' : ''}>PENDING</option>
                            <option value="APPROVED" ${currentStatus === 'APPROVED' ? 'selected' : ''}>APPROVED</option>
                            <option value="REJECTED" ${currentStatus === 'REJECTED' ? 'selected' : ''}>REJECTED</option>
                        </select>
                        <button class="save-status-btn" style="
                            margin-top:0.3rem; width:100%; background:#10b981; color:white; border:none; padding:0.4rem; border-radius:0.3rem;
                            cursor:pointer;">Save</button>
                    `;

                    // Call updatePayout on save
                    statusCell.querySelector(".save-status-btn").addEventListener("click", () => {
                        const newStatus = statusCell.querySelector("select").value;

                        updatePayout(token, payout.id, newStatus);
                    });
                });
            }
        });

    } catch (err) {
        console.error("Failed to load payouts:", err);
        alert("Unable to load payouts");
    }
}

// --------------------- Update Payout ---------------------
async function updatePayout(token, payoutId, newStatus, payoutAmount, userWalletBalance) {
    try {
        // ✅ Check wallet balance before calling backend
        if (userWalletBalance < payoutAmount && newStatus === "APPROVED") {
            alert(`❌ Cannot approve payout. User wallet balance ($${userWalletBalance.toFixed(2)}) is less than payout amount ($${payoutAmount.toFixed(2)}).`);
            setTimeout(() => {
                window.location.href = "taskReports.html";
            }, 100);


        }


        const res = await fetch(`http://localhost:8080/payouts/${payoutId}/status?status=${newStatus}`, {
            method: "PUT",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.message || `HTTP error! status: ${res.status}`);
        }

        alert("✅ " + (data.message || "Payout status updated successfully!"));
        await loadPayouts(token);

    } catch (err) {
        console.error("❌ Failed to update payout:", err);
        setTimeout(() => {
            window.location.href = "taskReports.html";
        }, 100);
        alert("❌ " + err.message);
    }
}



// --------------------- Search Payouts ---------------------
document.querySelector("#payout-search-input")?.addEventListener("input", function () {
    const searchTerm = this.value.toLowerCase();
    document.querySelectorAll("#payoutsTableBody tr").forEach(row => {
        const user = row.querySelector("td:nth-child(1)")?.textContent.toLowerCase() || "";
        row.style.display = user.includes(searchTerm) ? "" : "none";
    });
});



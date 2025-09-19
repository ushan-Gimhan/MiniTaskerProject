// --------------------- Load Submissions List with Update ---------------------
async function loadSubmissions(token) {
    try {
        const res = await fetch("http://localhost:8080/submission/getAll", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

        const submissions = await res.json();
        const tbody = document.querySelector("#dispute-resolution table tbody");
        tbody.innerHTML = "";

        if (!Array.isArray(submissions) || submissions.length === 0) {
            tbody.innerHTML = `<tr>
                <td colspan="10" style="text-align:center; padding:1rem; color:#9ca3af;">No disputes found</td>
            </tr>`;
            return;
        }

        submissions.forEach(sub => {
            const tr = document.createElement("tr");

            function getStatusColor(status) {
                switch(status) {
                    case 'PENDING': return '#f59e0b';
                    case 'APPROVED': return '#10b981';
                    case 'REJECTED': return '#ef4444';
                    case 'RESOLVED': return '#6366f1';
                    default: return '#d1d5db';
                }
            }

            tr.innerHTML = `
                <td>#${sub.id}</td>
                <td>${sub.task?.title || ''}</td>
                <td>@${sub.task?.client?.username || ''}</td>
                <td>@${sub.user?.username || ''}</td>
                <td class="status-cell" style="color:${getStatusColor(sub.status)};">${sub.status || 'Unknown'}</td>
                <td>${sub.reviewComment || '<i style="color:#9ca3af;">No review</i>'}</td>
                <td>${sub.description || '<i style="color:#9ca3af;">N/A</i>'}</td>
                <td>${sub.proofUrl ? `<a href="${sub.proofUrl}" target="_blank" style="color:#3b82f6; text-decoration:underline;">View Proof</a>` : '<i style="color:#9ca3af;">No proof</i>'}</td>
                <td>
                    <button class="update-btn" style="
                        background: linear-gradient(135deg, #1173d4 0%, #0ea5e9 100%);
                        color:white; border:none; padding:0.5rem 1rem; border-radius:0.5rem;
                        cursor:pointer; font-weight:500; font-size:0.875rem; transition: all 0.3s ease;
                        box-shadow: 0 2px 8px rgba(17,115,212,0.3);"
                        onmouseover="this.style.background='linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)'; this.style.transform='translateY(-1px)'; this.style.boxShadow='0 4px 12px rgba(17,115,212,0.4)';"
                        onmouseout="this.style.background='linear-gradient(135deg, #1173d4 0%, #0ea5e9 100%)'; this.style.transform='translateY(0)'; this.style.boxShadow='0 2px 8px rgba(17,115,212,0.3)';"
                    >Update</button>
                </td>
            `;

            tbody.appendChild(tr);

            // Update button click event
            tr.querySelector(".update-btn").addEventListener("click", () => {
                const statusCell = tr.querySelector(".status-cell");
                const currentStatus = sub.status || "PENDING";

                statusCell.innerHTML = `
                    <select style="
                        width:100%; padding:0.25rem; background-color:#374151; color:#f3f4f6;
                        border:1px solid #4b5563; border-radius:0.25rem; font-size:0.875rem; outline:none;
                        cursor:pointer;"
                    >
                        <option value="PENDING" ${currentStatus === 'PENDING' ? 'selected' : ''}>PENDING</option>
                        <option value="APPROVED" ${currentStatus === 'APPROVED' ? 'selected' : ''}>APPROVED</option>
                        <option value="REJECTED" ${currentStatus === 'REJECTED' ? 'selected' : ''}>REJECTED</option>
                        <option value="RESOLVED" ${currentStatus === 'RESOLVED' ? 'selected' : ''}>RESOLVED</option>
                    </select>
                    <button class="save-status-btn" style="
                        margin-top:0.3rem; width:100%; background:#10b981; color:white; border:none; padding:0.4rem; border-radius:0.3rem;
                        cursor:pointer;"
                    >Save</button>
                `;

                statusCell.querySelector(".save-status-btn").addEventListener("click", async () => {
                    const newStatus = statusCell.querySelector("select").value;

                    try {
                        const updateRes = await fetch(`http://localhost:8080/submission/update/${sub.id}`, {
                            method: "PUT",
                            headers: {
                                "Authorization": `Bearer ${token}`,
                                "Content-Type": "application/json"
                            },
                            body: JSON.stringify({ status: newStatus })
                        });

                        if (!updateRes.ok) throw new Error(`Update failed: ${updateRes.status}`);

                        sub.status = newStatus; // Update local object
                        statusCell.textContent = newStatus;
                        statusCell.style.color = getStatusColor(newStatus);
                        alert("✅ Status updated successfully!");
                    } catch (err) {
                        console.error(err);
                        alert("❌ Failed to update status.");
                    }
                });
            });
        });

    } catch (err) {
        console.error("Failed to load submissions:", err);
        const tbody = document.querySelector("#dispute-resolution table tbody");
        tbody.innerHTML = `<tr>
            <td colspan="10" style="text-align:center; color:red; padding:1rem;">Failed to load disputes. Please try again.</td>
        </tr>`;
    }
}

// --------------------- Auto Load ---------------------
document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem("jwtToken");
    loadSubmissions(token);
});
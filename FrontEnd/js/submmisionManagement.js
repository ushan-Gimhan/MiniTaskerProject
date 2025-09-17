// --------------------- Load Submissions ---------------------
async function loadDisputes() {
    try {
        // 🔑 Get token from local storage
        const token = localStorage.getItem("jwtToken");

        if (!token) {
            console.warn("No JWT token found in localStorage.");
            const tbody = document.querySelector("#dispute-resolution table tbody");
            tbody.innerHTML = `<tr>
                <td colspan="9" style="text-align:center; color:#ef4444; padding:1rem;">Not authorized. Please log in.</td>
            </tr>`;
            return;
        }

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
                <td colspan="9" style="text-align:center; padding:1rem; color:#9ca3af;">No disputes found</td>
            </tr>`;
            return;
        }

        submissions.forEach(sub => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>#${sub.id}</td>
                <td>${sub.task?.title || ''}</td>
                <td>@${sub.task?.client?.username || ''}</td>
                <td>@${sub.worker?.username || ''}</td>
                <td>
                    <select class="submission-status" 
                        style="padding:0.25rem 0.5rem; border-radius:0.25rem; color:darkblue; font-weight:600;">
                        <option value="PENDING" ${sub.status === 'PENDING' ? 'selected' : ''} style="background:#374151; color:#f59e0b;">Pending</option>
                        <option value="APPROVED" ${sub.status === 'APPROVED' ? 'selected' : ''} style="background:#374151; color:#10b981;">Approved</option>
                        <option value="REJECTED" ${sub.status === 'REJECTED' ? 'selected' : ''} style="background:#374151; color:#ef4444;">Rejected</option>
                    </select>
                </td>
                <td>
                    ${sub.reviewComment ? sub.reviewComment : '<i style="color:#9ca3af;">No review</i>'}
                </td>
                <td>
                    ${sub.description ? sub.description : '<i style="color:#9ca3af;">N/A</i>'}
                </td>
                <td>
                    ${sub.proofUrl
                ? `<a href="${sub.proofUrl}" target="_blank" style="color:#3b82f6; text-decoration:underline;">View Proof</a>`
                : '<i style="color:#9ca3af;">No proof</i>'}
                </td>
                <td class="action-buttons">
                    <button type="button" aria-label="View"><i class="fas fa-eye"></i></button>
                    <button type="button" aria-label="Edit"><i class="fas fa-edit"></i></button>
                    <button type="button" class="resolve-btn" aria-label="Resolve"><i class="fas fa-check-circle"></i></button>
                </td>
            `;
            tbody.appendChild(tr);
        });

    } catch (err) {
        console.error("Failed to load disputes:", err);
        const tbody = document.querySelector("#dispute-resolution table tbody");
        tbody.innerHTML = `<tr>
            <td colspan="9" style="text-align:center; color:red; padding:1rem;">Failed to load disputes. Please try again.</td>
        </tr>`;
    }
}


// --------------------- Helper ---------------------
function getStatusColor(status) {
    switch(status) {
        case 'Pending': return '#f59e0b';    // yellow
        case 'In Review': return '#6366f1'; // blue
        case 'Resolved': return '#10b981';  // green
        case 'Rejected': return '#ef4444';  // red
        default: return '#9ca3af';          // gray
    }
}

// --------------------- Auto Load ---------------------
document.addEventListener("DOMContentLoaded", loadDisputes);


// Example usage (after user login or token acquisition)
const token = "YOUR_JWT_TOKEN_HERE";
loadDisputes(token);

// --------------------- Actions ---------------------
function viewSubmission(id) {
    console.log("View submission", id);
    // Implement modal or redirect
}

function editSubmission(id) {
    console.log("Edit submission", id);
    // Implement edit form
}

async function resolveSubmission(id) {
    try {
        const token = localStorage.getItem("jwtToken"); // replace with actual auth token
        const res = await fetch(`http://localhost:8080/submission/update/${id}`, {
            method: "PUT",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ status: "Resolved" })
        });

        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

        alert(`Submission #${id} marked as Resolved.`);
        loadSubmissions(token); // Reload table
    } catch (err) {
        console.error("Failed to resolve submission:", err);
        alert("Failed to update status. Try again.");
    }
}

// Example: call this on page load
window.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem("jwtToken"); // replace with actual token logic
    loadSubmissions(token);
});

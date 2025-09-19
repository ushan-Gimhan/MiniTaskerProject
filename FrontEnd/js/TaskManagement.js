// --------------------- On Page Load ---------------------
window.addEventListener('load', async function () {
    const token = localStorage.getItem('jwtToken');

    if (!token) {
        console.warn("No JWT token found. Redirecting to login...");
        window.location.href = "login.html";
        return;
    }

    try {
        await loadTasks(token);
        console.log("✅ Task reports data loaded");
    } catch (err) {
        console.error("❌ Error loading task reports data:", err);
    }
});

// --------------------- Load Tasks List with Update ---------------------
async function loadTasks(token) {
    try {
        const res = await fetch("http://localhost:8080/task/getAll", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

        const tasks = await res.json();
        const tbody = document.querySelector("#reported-tasks-body");
        tbody.innerHTML = "";

        if (!Array.isArray(tasks) || tasks.length === 0) {
            tbody.innerHTML = `<tr>
                <td colspan="7" style="
                    text-align: center; 
                    color: #9ca3af; 
                    padding: 2rem;
                    background-color: #1f2937;
                    border: 1px solid #374151;
                    font-style: italic;
                ">No tasks found</td>
            </tr>`;
            return;
        }

        tasks.forEach(task => {
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
                if (status === "Pending") return "#f59e0b";
                if (status === "APPROVED") return "#10b981";
                if (status === "Rejected") return "#ef4444";
                return "#d1d5db";
            }
            tr.innerHTML = `
                <td style="padding:0.75rem; border:1px solid #374151; color:#f3f4f6; font-weight:500;">
                    ${task.title || ''}
                </td>
                <td style="padding:0.75rem; border:1px solid #374151; color:#d1d5db;">
                    ${task.client?.username || ''}
                </td>
                <td style="padding:0.75rem; border:1px solid #374151; color:#d1d5db;">
                    ${task.totalQuantity || 0}
                </td>
                <td style="padding:0.75rem; border:1px solid #374151; color:#d1d5db;">
                    ${task.totalPrice || 0}
                </td>
                <td class="status-cell" style="padding:0.75rem; border:1px solid #374151; color:${getStatusColor(task.status)};">
                    ${task.status || 'Unknown'}
                </td>
                <td style="padding:0.6rem; border:1px solid #374151; color:#d1d5db;">
                    ${task.description || ''}
                </td>
                <td style="padding:0.75rem; border:1px solid #374151;">
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
                // Replace the status cell with a select dropdown
                const statusCell = tr.children[4]; // 5th td
                const currentStatus = task.status || "Pending";

                statusCell.innerHTML = `
                    <select style="
                        width:100%; padding:0.5rem; background-color:#374151; color:#f3f4f6;
                        border:1px solid #4b5563; border-radius:0.5rem; font-size:0.875rem; outline:none;
                        cursor:pointer;"
                    >
                        <option value="Pending" ${currentStatus === 'Pending' ? 'selected' : ''}>PENDING</option>
                        <option value="APPROVED" ${currentStatus === 'APPROVED' ? 'selected' : ''}>APPROVED</option>
                        <option value="Rejected" ${currentStatus === 'Rejected' ? 'selected' : ''}>REJECT</option>
                    </select>
                    <button class="save-status-btn" style="
                        margin-top:0.3rem; width:100%; background:#10b981; color:white; border:none; padding:0.4rem; border-radius:0.3rem;
                        cursor:pointer;"
                    >Save</button>
                `;

                // Save status event
                statusCell.querySelector(".save-status-btn").addEventListener("click", async () => {
                    const newStatus = statusCell.querySelector("select").value;

                    try {
                        const updateRes = await fetch(`http://localhost:8080/task/update/${task.id}`, {
                            method: "PUT",
                            headers: {
                                "Authorization": `Bearer ${token}`,
                                "Content-Type": "application/json"
                            },
                            body: JSON.stringify({ status: newStatus })
                        });

                        if (!updateRes.ok) throw new Error(`Update failed: ${updateRes.status}`);

                        task.status = newStatus; // Update local task object
                        // Reload the row to show new status
                        statusCell.textContent = newStatus;
                        if (newStatus === "Pending") statusCell.style.color = "#f59e0b";
                        if (newStatus === "APPROVED") statusCell.style.color = "#10b981";
                        if (newStatus === "Rejected") statusCell.style.color = "#ef4444";
                        alert("✅ Status updated successfully!");
                    } catch (err) {
                        console.error(err);
                        alert("❌ Failed to update status.");
                    }
                });
            });
        });

    } catch (err) {
        console.error("Failed to load tasks:", err);
    }
}


// --------------------- Update Task ---------------------
async function updateTask(token, taskId, row) {
    const updatedTask = {
        quantity: row.querySelector("td:nth-child(3) input").value,
        price: row.querySelector("td:nth-child(4) input").value,
        status: row.querySelector("td:nth-child(5) select").value,
        description: row.querySelector("td:nth-child(6) input").value
    };

    try {
        const res = await fetch(`http://localhost:8080/tasks/${taskId}`, {
            method: "PUT",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(updatedTask)
        });

        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

        alert("Task updated successfully ✅");
    } catch (err) {
        console.error("Failed to update task:", err);
        alert("Failed to update task ❌");
    }
}

// --------------------- Delete Task ---------------------
async function deleteTask(token, taskId, row) {
    if (!confirm("Are you sure you want to delete this task?")) return;

    try {
        const res = await fetch(`http://localhost:8080/tasks/${taskId}`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

        row.remove();
        alert("Task deleted successfully ✅");
    } catch (err) {
        console.error("Failed to delete task:", err);
        alert("Failed to delete task ❌");
    }
}

// --------------------- Search Tasks ---------------------
document.querySelector("#task-search-input")?.addEventListener("input", function () {
    const searchTerm = this.value.toLowerCase();
    document.querySelectorAll("#reported-tasks-body tr").forEach(row => {
        const title = row.querySelector("td:nth-child(1)")?.textContent.toLowerCase() || "";
        const user = row.querySelector("td:nth-child(2)")?.textContent.toLowerCase() || "";
        row.style.display = title.includes(searchTerm) || user.includes(searchTerm) ? "" : "none";
    });
});



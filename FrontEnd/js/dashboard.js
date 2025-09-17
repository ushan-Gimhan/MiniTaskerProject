// --------------------- Check JWT token on page load ---------------------
window.addEventListener('load', async function () {
    const token = localStorage.getItem('jwtToken');

    if (!token) {
        console.warn("No JWT token found. Showing Guest header.");
        updateLoginHeader("Guest");
        return;
    }

    try {
        const user = await loadUserDetails(token);
        const username = user.username || "User";
        window.currentUserId = user.id; // store globally for submissions

        console.log("Logged in user:", user);

        updateLoginHeader(username);
        const headerUsernameEl = document.getElementById("headerUsername");
        if (headerUsernameEl) {
            headerUsernameEl.textContent = `Welcome!!!, ${username}!`;
        }

        initializeDashboard();

    } catch (err) {
        console.error("Error initializing dashboard:", err);
        updateLoginHeader("Guest");
        localStorage.removeItem('jwtToken');
    }
});

// --------------------- Load User Details ---------------------
async function loadUserDetails(token) {
    const response = await fetch("http://localhost:8080/auth/user", {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
        }
    });

    if (!response.ok) throw new Error(`Failed to fetch user details (status ${response.status})`);

    const user = await response.json();
    if (!user || !user.username) throw new Error("Invalid user data from server");

    return user;
}

// --------------------- Update Login Page Header ---------------------
function updateLoginHeader(username) {
    const loginSubtitle = document.querySelector(".login-subtitle");
    const welcomeText = document.querySelector(".welcome-text");

    if (loginSubtitle) loginSubtitle.textContent = `Welcome back, ${username}!`;
    if (welcomeText) welcomeText.textContent = `Sign in to continue earning, ${username}`;
}

// --------------------- Initialize Dashboard ---------------------
function initializeDashboard() {
    console.log("Initializing dashboard...");

    const progressBars = document.querySelectorAll('.progress-fill');
    progressBars.forEach(bar => {
        const width = bar.getAttribute("data-progress") || bar.style.width;
        setTimeout(() => { bar.style.width = width; }, 500);
    });
}

// --------------------- Task AJAX and Rendering ---------------------
$(document).ready(function () {
    const apiURL = "http://localhost:8080/task/getAll";
    const token = localStorage.getItem('jwtToken');

    function renderTasks(tasks) {
        const taskList = $("#taskList");
        taskList.empty();
        taskList.css({
            "display": "grid",
            "grid-template-columns": "repeat(auto-fill, minmax(250px, 1fr))",
            "gap": "20px",
            "justify-items": "center",
        });

        if (!Array.isArray(tasks) || tasks.length === 0) {
            taskList.html("<p class='text-gray-500'>No tasks found.</p>");
            return;
        }

        tasks.forEach(task => {
            const taskItem = $(`
                <div class="task-card" style="width:250px; border:1px solid #ddd; border-radius:8px; overflow:hidden; display:flex; flex-direction:column;">
                    <div class="task-image" style="width:100%; height:150px; background:#f5f5f5; display:flex; align-items:center; justify-content:center;">
                        ${task.imageName ? `<img src="${task.imageName}" alt="task image" style="width:100%; height:100%; object-fit:cover;">` : '<span style="color:#999;">No Image</span>'}
                    </div>
                    <div style="padding:10px; flex:1; display:flex; flex-direction:column; justify-content:space-between;">
                        <div>
                            <div class="task-title" style="font-weight:bold; font-size:18px; margin-bottom:5px; color:#222;">${task.title || 'Untitled'}</div>
                            <div class="task-description" style="font-size:16px; color:#555; margin-bottom:8px;">${task.description || ''}</div>
                        </div>
                        <div style="font-size:16px; color:#333; margin-bottom:10px;">
                            <span>💰 ${task.rewardPerTask != null ? '$' + task.rewardPerTask : '-'}</span><br>
                            <span>🗂 Vacancy Available: ${task.totalQuantity || 0}</span><br>
                        </div>
                        <button class="apply-btn" style="padding:8px; border:none; background:#fbbf24; color:white; border-radius:4px; cursor:pointer; width:100%;">Apply</button>
                    </div>
                </div>
            `);

            taskList.append(taskItem);

            taskItem.find(".apply-btn").on('click', function (e) {
                e.stopPropagation();

                // Use global currentUserId for workerId
                applyForTask(token, task.id, window.currentUserId, "", "")
                    .then(res => {
                        console.log("✅ Applied:", res);
                        openTaskForm();
                        $("#taskSubmissionModal .modal-title").text(`Submit Task: ${task.title}`);
                    })
                    .catch(err => {
                        alert("❌ Failed to apply: " + err.message);
                    });
            });

            taskItem.on('click', function () {
                alert(`Opening task details for: ${task.title || 'Task'}`);
            });
        });
    }

    function loadTasks(callback) {
        $.ajax({
            url: apiURL,
            type: "GET",
            dataType: "json",
            headers: { "Authorization": `Bearer ${token}` },
            success: function (response) {
                console.log("✅ Got tasks:", response);
                renderTasks(response);
                if (callback) callback(response);
            },
            error: function (xhr) {
                console.error("❌ Error fetching tasks", xhr.responseText);
                $("#taskList").html(`<p class='text-red-500'>Failed to load tasks. (${xhr.status})</p>`);
            }
        });
    }

    window.filterTasks = function (status) {
        loadTasks(function (response) {
            let filtered = response;
            if (status !== "all") {
                filtered = response.filter(task => task.status && task.status.toLowerCase().includes(status.toLowerCase()));
            }
            renderTasks(filtered);
        });
    };

    loadTasks();
});

// --------------------- Task Submission Modal ---------------------
function openTaskForm() {
    $('#taskSubmissionModal').fadeIn();
}
function closeTaskForm() {
    $('#taskSubmissionModal').fadeOut();
}

// --------------------- Apply Task API ---------------------
async function applyForTask(token, taskId, workerId, proofUrl, description) {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: `http://localhost:8080/submission/create`,
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            data: JSON.stringify({
                taskId: taskId,
                workerId: workerId,
                proofUrl: proofUrl || "",
                status: "PENDING",
                reviewComment: "",
                description: description || ""
            }),
            success: function (response) {
                console.log("✅ Submission created:", response);
                resolve(response);
            },
            error: function (xhr, status, error) {
                console.error("❌ applyForTask error:", status, error, xhr.responseText);
                reject(new Error(`Failed to apply task (status ${xhr.status})`));
            }
        });
    });
}

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

        console.log("Logged in user:", user);

        // Update headers
        updateLoginHeader(username);
        const headerUsernameEl = document.getElementById("headerUsername");
        if (headerUsernameEl) {
            headerUsernameEl.textContent = `Welcome!!!, ${username}!`;
        }

        // Initialize dashboard
        initializeDashboard();

    } catch (err) {
        console.error("Error initializing dashboard:", err);
        updateLoginHeader("Guest");
        localStorage.removeItem('jwtToken');
    }
});

// --------------------- Load User Details ---------------------
async function loadUserDetails(token) {
    try {
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
    } catch (err) {
        console.error("loadUserDetails error:", err);
        throw err;
    }
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

    window.openModal = function(type) {
        alert(`Opening ${type} modal - Placeholder`);
    };
}


// --------------------- Task AJAX and Rendering ---------------------
$(document).ready(function () {
    const apiURL = "http://localhost:8080/task/getAll";
    const token = localStorage.getItem('jwtToken');

    // ---------------- Render Tasks ----------------
    function renderTasks(tasks) {
        const taskList = $("#taskList");
        taskList.empty();

        // ✅ make container grid (side by side cards)
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
                <div class="task-card" style="width:250px; border:1px solid #ddd; border-radius:8px; overflow:hidden; box-shadow:0 2px 5px rgba(0,0,0,0.1); display:flex; flex-direction:column;">
                    
                    <!-- Task Image -->
                    <div class="task-image" style="width:100%; height:150px; background:#f5f5f5; display:flex; align-items:center; justify-content:center;">
                        ${task.imageName
                ? `<img src="${task.imageName}" alt="task image" style="width:100%; height:100%; object-fit:cover;">`
                : '<span style="color:#999;">No Image</span>'}
                    </div>

                    <!-- Task Content -->
                    <div style="padding:10px; flex:1; display:flex; flex-direction:column; justify-content:space-between;">
                        <div>
                            <div class="task-title" style="font-weight:bold; font-size:18px; margin-bottom:5px; color:#222;">
                                ${task.title || 'Untitled'}
                            </div>
                            <div class="task-description" style="font-size:16px; color:#555; margin-bottom:8px;">
                                ${task.description || ''}
                            </div>
                        </div>

                        <div style="font-size:16px; color:#333; margin-bottom:10px;">
                            <span>💰 $: ${task.rewardPerTask != null ? '$' + task.rewardPerTask : '-'}</span><br>
                            <span>🗂 Vacancy Avaliable: ${task.totalQuantity || 0}</span><br>
                        </div>

                        <!-- Apply Button -->
                        <button  id="topUpButton" class="apply-btn" style="padding:8px; border:none; background:#fbbf24; color:white; border-radius:4px; cursor:pointer; width:100%;">
                            Apply
                        </button>
                    </div>
                </div>
            `);

            taskList.append(taskItem);

            // Click listener
            taskItem.find(".apply-btn").on('click', function (e) {
                e.stopPropagation();
                alert(`Applying for: ${task.title || 'Task'}`);
            });

            taskItem.on('click', function () {
                alert(`Opening task details for: ${task.title || 'Task'}`);
            });
        });

    }

    // ---------------- Load Tasks from Backend ----------------
    function loadTasks(callback) {
        $.ajax({
            url: apiURL,
            type: "GET",
            dataType: "json",
            headers: {
                "Authorization": `Bearer ${token}`
            },
            success: function (response) {
                console.log("✅ Got tasks:", response);
                renderTasks(response);
                if (callback) callback(response);
            },
            error: function (xhr, status, error) {
                console.error("❌ Error fetching tasks");
                console.log("Status:", status);
                console.log("HTTP Code:", xhr.status);
                console.log("Response Text:", xhr.responseText);
                $("#taskList").html(`<p class='text-red-500'>Failed to load tasks. (${xhr.status})</p>`);
            }
        });
    }

    // ---------------- Filter Tasks by Status ----------------
    window.filterTasks = function (status) {
        loadTasks(function (response) {
            let filtered = response;
            if (status !== "all") {
                filtered = response.filter(task =>
                    task.status && task.status.toLowerCase().includes(status.toLowerCase())
                );
            }
            renderTasks(filtered);
        });
    };

    // ---------------- Initial Load ----------------
    loadTasks();
});
function openTaskForm() {
    $('#taskSubmissionModal').fadeIn();
}

function closeTaskForm() {
    $('#taskSubmissionModal').fadeOut();
}

// Example: automatically attach to a "Top Up" or "Submit Task" button
$('#topUpButton').on('click', function() {
    openTaskForm();
});



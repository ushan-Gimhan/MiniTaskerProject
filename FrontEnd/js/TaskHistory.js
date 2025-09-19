$(document).ready(async function () {
    const apiBaseURL = "http://localhost:8080/task/user"; // Base URL
    const token = localStorage.getItem('jwtToken'); // JWT token

    if (!token) {
        console.error("❌ No JWT token found. Please login.");
        $("#jobList").html("<p class='text-red-500'>Please login to view tasks.</p>");
        return;
    }

    // Load user details
    let user = null;
    try {
        user = await loadUserDetails(token);
    } catch (err) {
        console.error("❌ Failed to load user details:", err);
        $("#jobList").html("<p class='text-red-500'>Failed to load user info. Please login again.</p>");
        return;
    }

    const userId = user?.id;
    if (!userId) {
        $("#jobList").html("<p class='text-red-500'>Invalid user. Please login again.</p>");
        return;
    }

    // Function to render tasks
    function renderTasks(tasks) {
        const jobList = $("#jobList");
        jobList.empty();

        if (!Array.isArray(tasks) || tasks.length === 0) {
            jobList.html("<p class='text-gray-500'>No tasks available.</p>");
            return;
        }

        tasks.forEach(task => {
            const taskCard = $(`
                <div class="task-card" data-status="${task.status?.toLowerCase() || 'all'}"
                     style="width:250px; border:1px solid #ddd; border-radius:8px; overflow:hidden; display:flex; flex-direction:column;">
                     
                    <!-- Task Image -->
                    <div class="task-image" style="width:100%; height:150px; background:#f5f5f5; display:flex; align-items:center; justify-content:center; position:relative;">
                        ${task.imageName
                ? `<img src="${task.imageName}" alt="task image" style="width:100%; height:100%; object-fit:cover;">`
                : '<span style="color:#999;">No Image</span>'}
                        <span class="status-badge" 
                              style="position:absolute; top:8px; right:8px; background:#374151; color:white; font-size:12px; padding:4px 8px; border-radius:4px;">
                              ${task.status || "Unknown"}
                        </span>
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
                            <span>💰 ${task.rewardPerTask != null ? '$' + task.rewardPerTask : '-'}</span><br>
                            <span>🗂 Vacancy Available: ${task.totalQuantity || 0}</span><br>
                        </div>

                        <!-- Apply Button -->
                        <button class="apply-btn" style="padding:8px; border:none; background:#fbbf24; color:white; border-radius:4px; cursor:pointer; width:100%;">
                           
                        </button>
                    </div>
                </div>
            `);

            jobList.append(taskCard);
        });
    }

    // Function to load tasks from API with optional status
    function loadTasks(status = "all") {
        let url = `${apiBaseURL}/${userId}`;
        if (status !== "all") {
            url += `?status=${status}`;
        }

        $.ajax({
            url: url,
            type: "GET",
            dataType: "json",
            headers: { "Authorization": `Bearer ${token}` },
            success: function (response) {
                console.log(`✅ Tasks loaded for status "${status}":`, response);
                renderTasks(response);
            },
            error: function (xhr) {
                console.error("❌ Error fetching tasks:", xhr.responseText || xhr.statusText);
                $("#jobList").html(`<p class='text-red-500'>Failed to load tasks. (${xhr.status})</p>`);
            }
        });
    }

    // Initial load: all tasks
    loadTasks();

    // Tab click event
    $(".tab-link").on("click", function () {
        $(".tab-link").removeClass("active");
        $(this).addClass("active");

        const status = $(this).data("status");
        loadTasks(status); // Fetch tasks based on clicked tab's status
    });
});

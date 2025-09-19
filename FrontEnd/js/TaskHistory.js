$(document).ready(async function () {
    const apiBaseURL = "http://localhost:8080/task/user"; // Base URL
    const token = localStorage.getItem('jwtToken'); // JWT token
    const user = await loadUserDetails(token);
    const userId = user.id;

    // Function to render tasks
    function renderTasks(tasks) {
        const jobList = $("#jobList");
        jobList.empty();

        if (!Array.isArray(tasks) || tasks.length === 0) {
            jobList.html("<p class='text-gray-500'>No tasks available.</p>");
            return;
        }

        tasks.forEach(task => {
            const taskItem = $(`
                <div class="task-item" data-status="${task.status.toLowerCase()}">
                    <p class="task-title">${task.title || "Untitled Task"}</p>
                    <p class="task-client">Client: ${task.client?.username || "-"}</p>
                    <p class="coin-value ${task.status.toLowerCase()}">${task.rewardPerTask ? '+' + task.rewardPerTask + ' coins' : '-'}</p>
                    <span class="status-badge status-${task.status.toLowerCase()}">${task.status}</span>
                </div>
            `);
            jobList.append(taskItem);
        });
    }

    // Function to load tasks from API with optional status
    function loadTasks(status = "all") {
        let url = `${apiBaseURL}/${userId}`;
        if (status !== "all") {
            url += `?status=${status}`; // Pass status as query param if not "all"
        }

        $.ajax({
            url: url,
            type: "GET",
            dataType: "json",
            headers: {"Authorization": `Bearer ${token}`},
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

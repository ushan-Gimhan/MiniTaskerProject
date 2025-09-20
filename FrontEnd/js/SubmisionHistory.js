$(document).ready(async function () {
    const apiBaseURL = "http://localhost:8080/auth/user"; // Backend endpoint to get submissions by user ID
    const token = localStorage.getItem('jwtToken'); // JWT token

    if (!token) {
        console.error("❌ No JWT token found. Please login.");
        $("#taskList").html("<p class='text-red-500'>Please login to view tasks.</p>");
        return;
    }

    // Load logged-in user details
    let user = null;
    try {
        user = await loadUserDetails(token); // Your function to get user info
    } catch (err) {
        console.error("❌ Failed to load user details:", err);
        $("#taskList").html("<p class='text-red-500'>Failed to load user info. Please login again.</p>");
        return;
    }

    const userId = user?.id;
    if (!userId) {
        $("#taskList").html("<p class='text-red-500'>Invalid user. Please login again.</p>");
        return;
    }

    let allSubmissions = []; // Global array to store submissions

    // Function to render submissions
    function renderSubmissions(submissions) {
        const taskList = $("#taskList");
        taskList.empty();

        if (!submissions || submissions.length === 0) {
            taskList.html("<p class='text-gray-500'>No submissions found.</p>");
            return;
        }

        submissions.forEach(submission => {
            const statusLower = submission.status?.toLowerCase() || 'unknown';
            const taskItem = $(`
        <div class="task-card" data-status="${statusLower}" 
             style="width:250px; border:1px solid #ddd; border-radius:8px; overflow:hidden; display:flex; flex-direction:column; margin-bottom:10px;">

            <div class="task-image" style="width:100%; height:150px; background:#f5f5f5; display:flex; align-items:center; justify-content:center; position:relative;">
                ${submission.imageName ?
                `<img src="${submission.imageName}" alt="task image" style="width:100%; height:100%; object-fit:cover;">`
                : '<span style="color:#999;">No Image</span>'}
                <span class="status-badge" 
                      style="position:absolute; top:8px; right:8px; background:#374151; color:white; font-size:12px; padding:4px 8px; border-radius:4px;">
                      ${submission.submissionStatus || "Unknown"}
                </span>
            </div>

            <div style="padding:10px; flex:1; display:flex; flex-direction:column; justify-content:space-between;">
                <div>
                    <div class="task-title" style="font-weight:bold; font-size:18px; margin-bottom:5px; color:#222;">
                        ${submission.title || 'Untitled'}
                    </div>
                    <div class="task-description" style="font-size:16px; color:#555; margin-bottom:8px;">
                        ${submission.description || ''}
                    </div>
                </div>

                <div style="font-size:16px; color:#333; margin-bottom:10px;">
                    <span>💰 ${submission.rewardPerTask != null ? '$' + submission.rewardPerTask : '-'}</span><br>
                    <span>🗂 Vacancy Available: ${submission.availableQuantity || 0}</span>
                </div>
            </div>
        </div>
    `);
            $("#taskList").append(taskItem);
        });

    }

    // Filter submissions by status
    function filterSubmissions(status) {
        if (status === "all") {
            renderSubmissions(allSubmissions);
        } else {
            const filtered = allSubmissions.filter(s => s.status?.toLowerCase() === status);
            renderSubmissions(filtered);
        }
    }

    // Tab click handler
    $("#taskHistory .tab-link").on("click", function () {
        $("#taskHistory .tab-link").removeClass("active");
        $(this).addClass("active");

        const status = $(this).data("status");
        filterSubmissions(status);
    });

    // Fetch all submissions for the logged-in user
    $.ajax({
        url: `http://localhost:8080/submission/tasks/user/${userId}`, // e.g., /submission/get/user/{userId}
        type: "GET",
        headers: { "Authorization": `Bearer ${token}` },
        dataType: "json",
        success: function (response) {
            console.log("✅ Submissions loaded:", response);
            allSubmissions = response;
            renderSubmissions(allSubmissions); // Render all initially
        },
        error: function (xhr) {
            console.error("❌ Failed to load submissions:", xhr.responseText || xhr.statusText);
            $("#taskList").html("<p class='text-red-500'>Failed to load submissions.</p>");
        }
    });
});

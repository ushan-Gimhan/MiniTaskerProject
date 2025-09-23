//
// function validateAndLoadDashboard() {
//     let token = localStorage.getItem('jwtToken');
//
//     if (!token) {
//         window.location.href = '/Home.html';
//         return;
//     }
//
//     const tokenParts = token.split('.');
//     if (tokenParts.length !== 3) {
//         window.location.href = '/Home.html';
//         return;
//     }
//
//     try {
//         const tokenPayload = JSON.parse(atob(tokenParts[1]));
//         const currentTimestamp = Math.floor(Date.now() / 1000); // ❌ ඔබේ code එකේ 10000, should be 1000
//
//         if (tokenPayload.exp && currentTimestamp >= tokenPayload.exp) {
//             alert('Session expired. Please login again.');
//             localStorage.removeItem('jwtToken');
//             window.location.href = '/Home.html';
//             return;
//         }
//
//         // ✅ Role check
//         if (tokenPayload.role) {
//             if (tokenPayload.role === 'ADMIN') {
//                 console.log('Admin logged in');
//                 // admin dashboard logic
//             } else if (tokenPayload.role === 'USER') {
//                 console.log('User logged in');
//                 // user dashboard logic
//             } else {
//                 console.warn('Unknown role, redirecting to login');
//                 window.location.href = '/Home.html';
//             }
//         } else {
//             console.warn('Role not found in token');
//             window.location.href = '/Home.html';
//         }
//
//     } catch (error) {
//         console.error('Invalid token:', error);
//         window.location.href = '/Home.html';
//     }
// }


// --------------------- Check JWT token on page load ---------------------
window.addEventListener('load', async function () {
    const token = localStorage.getItem('jwtToken');

    try {
        const user = await loadUserDetails(token);
        const username = user.username || "User";
        window.currentUserId = user.id; // store globally for submissions
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
        setTimeout(() => {
            bar.style.width = width;
        }, 500);
    });
}

// --------------------- Load & Render Tasks ---------------------
$(document).ready(async function () {
    const apiURL = "http://localhost:8080/task/approved";
    const token = localStorage.getItem('jwtToken');
    const user = await loadUserDetails(token);
    const username = user.username || "User";

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
            taskList.html("<p class='text-gray-500'>No approved tasks available.</p>");
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
                            <span>💰Price: ${task.rewardPerTask != null ? '$' + task.rewardPerTask : '-'}</span><br>
                            <span>🗂 Vacancy Available: ${task.availableQuantity || 0}</span><br>
                            <span>🗂 Total Vacancy Available: ${task.totalQuantity || 0}</span><br>
                        </div>
                        <button class="apply-btn" style="padding:8px; border:none; background:#fbbf24; color:white; border-radius:4px; cursor:pointer; width:100%;">Apply</button>
                    </div>
                </div>
            `);

            // Hook Apply button
            taskItem.find(".apply-btn").on("click", function () {
                $("#taskId").val(task.id); // set hidden input with taskId
                updateTaskInfo(task);
                openTaskForm(); // show modal
            });

            taskList.append(taskItem);
        });
    }

    function loadTasks() {
        $.ajax({
            url: apiURL,
            type: "POST",
            contentType: "application/json",
            dataType: "json",
            headers: { "Authorization": `Bearer ${token}` },
            data: JSON.stringify({ username: username }),
            success: function (response) {
                console.log("✅ Approved tasks:", response);
                renderTasks(response);
            },
            error: function (xhr) {
                console.error("❌ Error fetching tasks:", xhr.responseText);
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
    $('body').addClass('modal-open');
}

function closeTaskForm() {
    $('#taskSubmissionModal').fadeOut();
    $('body').removeClass('modal-open');

    const token = localStorage.getItem('jwtToken');
    if (token) loadSubmissions(token);
}

$("#taskSubmissionForm").on("submit", async function (e) {
    e.preventDefault();

    const submitBtn = $(this).find('button[type="submit"]');
    const originalBtnText = submitBtn.text();
    submitBtn.prop('disabled', true).html('<i class="spinner"></i> Submitting...');

    showLoadingOverlay();

    try {
        const token = localStorage.getItem('jwtToken');
        const taskId = $("#taskId").val();
        const workerId = window.currentUserId;
        const description = $("#descriptionWork").val().trim();
        const reviewComment = $("#reviewComment").val().trim();
        const file = $("#proofFile")[0].files[0];

        if (!validateSubmissionForm(taskId, workerId, description, file)) return;

        showProgressMessage("📤 Uploading proof file...", "info");
        const proofUrl = await uploadFileToImgBB(file);

        showProgressMessage("📝 Submitting your task...", "info");
        await submitTaskToBackend({ taskId, workerId, description, proofUrl, reviewComment, status: "PENDING" }, token);

        showSuccessMessage("🎉 Task submitted successfully!", "Your work has been submitted for review. You'll be notified once it's approved!");
        setTimeout(() => { window.location.href = "dashboard.html"; }, 2000);
        closeTaskForm();
        refreshDashboardData(token);

    } catch (error) {
        console.error("Task submission error:", error);
        showErrorMessage("❌ Submission Failed", error.message);
    } finally {
        submitBtn.prop('disabled', false).text(originalBtnText);
        hideLoadingOverlay();
    }
});

// --------------------- Form Validation ---------------------
function validateSubmissionForm(taskId, workerId, description, file) {
    const errors = [];
    if (!taskId) errors.push("Task ID is missing");
    if (!workerId) errors.push("User not logged in");
    // if (!description || description.length < 10) errors.push("Please provide a detailed description (at least 10 characters)");
    if (!file) errors.push("Please select a proof file to upload");
    else {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        const maxSize = 5 * 1024 * 1024;
        if (!allowedTypes.includes(file.type)) errors.push("Please upload an image file (JPEG, PNG, GIF, or WebP)");
        if (file.size > maxSize) errors.push("File size must be less than 5MB");
    }
    if (errors.length > 0) {
        showErrorMessage("⚠️ Please fix the following issues:", errors.join("<br>• "));
        return false;
    }
    return true;
}

// --------------------- ImgBB File Upload ---------------------
async function uploadFileToImgBB(file) {
    const imgbbApiKey = "b56b8866f0ddb6ccb4adcf435a94347b";
    const formData = new FormData();
    formData.append("image", file);

    try {
        const response = await fetch(`https://api.imgbb.com/1/upload?key=${imgbbApiKey}`, { method: "POST", body: formData });
        if (!response.ok) throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
        const result = await response.json();
        if (!result.success) throw new Error(result.error?.message || "Image upload failed");
        return result.data.url;
    } catch (error) {
        throw new Error(`Failed to upload image: ${error.message}`);
    }
}

// --------------------- Backend Submission ---------------------
async function submitTaskToBackend(submissionData, token) {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: "http://localhost:8080/submission/create",
            method: "POST",
            headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
            data: JSON.stringify(submissionData),
            timeout: 30000,
            success: function(response) {
                // ✅ Show alert after successful save
                alert("✅ Task submitted successfully!");
                resolve(response);
            },
            error: function (xhr, status, error) {
                let errorMessage = "Unknown error occurred";
                if (xhr.responseText) {
                    try { errorMessage = JSON.parse(xhr.responseText).message || xhr.responseText; }
                    catch { errorMessage = xhr.responseText; }
                } else if (status === "timeout") errorMessage = "Request timed out. Please try again.";
                else if (xhr.status === 401) {
                    errorMessage = "Session expired. Please login again.";
                    setTimeout(() => { window.location.href = "login.html"; }, 2000);
                } else errorMessage = `Server error (${xhr.status}): ${error}`;

                reject(new Error(errorMessage));
            }
        });
    });
}

// --------------------- UI Helpers ---------------------
function showProgressMessage(message, type = "info") {
    $(".progress-message").remove();
    const alertClass = type === "info" ? "alert-info" : "alert-warning";
    const progressHtml = $(`
        <div class="alert ${alertClass} progress-message" style="margin: 15px 0;">
            <div class="d-flex align-items-center">
                <div class="spinner-border spinner-border-sm me-2" role="status"></div>
                <span>${message}</span>
            </div>
        </div>
    `);
    $("#taskSubmissionForm").prepend(progressHtml);
}

function showSuccessMessage(title, message) {
    $(".progress-message").remove();
    const successHtml = $(`
        <div class="alert alert-success success-message" style="margin: 15px 0; text-align: center;">
            <h5>${title}</h5>
            <p class="mb-0">${message}</p>
        </div>
    `);
    $("#taskSubmissionForm").prepend(successHtml);
}

function showErrorMessage(title, message) {
    $(".progress-message").remove();
    const errorHtml = $(`
        <div class="alert alert-danger error-message" style="margin: 15px 0;">
            <h6>${title}</h6>
            <div>${message}</div>
        </div>
    `);
    $("#taskSubmissionForm").prepend(errorHtml);
}

function showLoadingOverlay() {
    if ($("#loadingOverlay").length === 0) {
        $("body").append(`
            <div id="loadingOverlay" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; z-index: 9999;">
                <div style="background: white; padding: 30px; border-radius: 10px; text-align: center; box-shadow: 0 10px 30px rgba(0,0,0,0.3);">
                    <div class="spinner-border text-primary mb-3" role="status"></div>
                    <h5>Processing your submission...</h5>
                    <p class="text-muted mb-0">Please wait while we upload and submit your work.</p>
                </div>
            </div>
        `);
    }
}

function hideLoadingOverlay() {
    $("#loadingOverlay").remove();
}

function refreshDashboardData(token) {
    if (typeof loadTasks === "function") loadTasks();
    if (typeof loadSubmissions === "function") loadSubmissions(token);
}

// --------------------- File Preview ---------------------
$("#proofFile").on("change", function () {
    const file = this.files[0];
    const preview = $("#filePreview");

    if (file) {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            showErrorMessage("⚠️ Invalid File Type", "Please select an image file (JPEG, PNG, GIF, or WebP)");
            this.value = '';
            return;
        }

        const reader = new FileReader();
        reader.onload = function (e) {
            const fileSize = (file.size / 1024 / 1024).toFixed(2);
            const previewHtml = $(`
                <div id="filePreview" style="margin-top: 15px; padding: 15px; border: 2px solid #e2e8f0; border-radius: 12px; background: linear-gradient(145deg, #f8fafc, #ffffff); text-align: center; position: relative; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                    <div style="position: relative; display: inline-block;">
                        <img src="${e.target.result}" style="max-width: 250px; max-height: 200px; border-radius: 8px; border: 2px solid #fbbf24; box-shadow: 0 4px 15px rgba(0,0,0,0.2); object-fit: cover;">
                        <button type="button" id="removePreview" style="position: absolute; top: -8px; right: -8px; background: #ef4444; color: white; border: none; border-radius: 50%; width: 24px; height: 24px; font-size: 12px; cursor: pointer; box-shadow: 0 2px 5px rgba(0,0,0,0.3);" title="Remove image">×</button>
                    </div>
                    <div style="margin-top: 10px;">
                        <p style="margin: 5px 0; font-weight: 600; color: #1f2937; font-size: 14px;">📎 ${file.name}</p>
                        <div style="display: flex; justify-content: center; gap: 15px; margin-top: 8px;">
                            <span style="background: #fbbf24; color: white; padding: 4px 8px; border-radius: 6px; font-size: 12px; font-weight: 600;">📏 ${fileSize} MB</span>
                            <span style="background: ${fileSize > 5 ? '#ef4444' : '#10b981'}; color: white; padding: 4px 8px; border-radius: 6px; font-size: 12px; font-weight: 600;">${fileSize > 5 ? '⚠️ Too Large' : '✅ Size OK'}</span>
                        </div>
                    </div>
                </div>
            `);

            if (preview.length === 0) $("#proofFile").after(previewHtml);
            else preview.replaceWith(previewHtml);

            $("#removePreview").on("click", function () {
                $("#proofFile").val('');
                $("#filePreview").remove();
            });

            if (fileSize > 5) {
                showErrorMessage("⚠️ File Size Warning", "This file is larger than 5MB and may fail to upload. Please consider resizing it.");
            }
        };
        reader.readAsDataURL(file);
    } else {
        $("#filePreview").remove();
    }
});

// --------------------- Update Task Info in Modal ---------------------
function updateTaskInfo(task) {
    const titleEl = document.getElementById("taskTitle");
    if (titleEl) titleEl.textContent = task.title || "Untitled Task";

    const descEl = document.getElementById("taskDescription");
    if (descEl) {
        let stepsHtml = "";
        if (Array.isArray(task.steps) && task.steps.length > 0) {
            stepsHtml = "<ul>" + task.steps.map(step => `<li>${step}</li>`).join("") + "</ul>";
        }
        descEl.innerHTML = `<p>${task.description || ""}</p>${stepsHtml}`;
    }

    const rewardEl = document.getElementById("taskReward");
    if (rewardEl) {
        rewardEl.textContent = task.rewardPerTask != null ?
            task.rewardPerTask.toLocaleString('en-US', { style: 'currency', currency: 'USD' }) : "-";
    }
}

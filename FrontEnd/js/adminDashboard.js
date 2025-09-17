// // --------------------- On Page Load ---------------------
// window.addEventListener('load', async function () {
//     const token = localStorage.getItem('jwtToken');
//
//     if (!token) {
//         console.warn("No JWT token found. Redirecting to login...");
//         window.location.href = "login.html"; // Redirect if not logged in
//         return;
//     }
//
//     try {
//         await loadDashboardData(token);
//         console.log("✅ Dashboard data loaded successfully");
//     } catch (err) {
//         console.error("❌ Error loading dashboard data:", err);
//     }
// });
//
// // --------------------- Load Dashboard Data ---------------------
// async function loadDashboardData(token) {
//     // Load statistics
//     $.ajax({
//         url: "http://localhost:8080/admin/statistics", // API endpoint
//         method: "GET",
//         headers: { "Authorization": `Bearer ${token}` },
//         success: function (data) {
//             $("#totalUsers").text(data.totalUsers || 0);
//             $("#tasksCompleted").text(data.tasksCompleted || 0);
//             $("#coinsDistributed").text(data.coinsDistributed || 0);
//         },
//         error: function (xhr) {
//             console.error("Failed to load statistics:", xhr.responseText);
//         }
//     });
//
//     // Load earnings overview
//     $.ajax({
//         url: "http://localhost:8080/admin/earnings", // API endpoint
//         method: "GET",
//         headers: { "Authorization": `Bearer ${token}` },
//         success: function (data) {
//             $(".earnings-trend").text(`${data.trendPercentage >= 0 ? '+' : ''}${data.trendPercentage}%`);
//             $(".earnings-vs-text").text(`vs last 30 days`);
//             // Optional: render chart dynamically using SVG or a chart library
//         },
//         error: function (xhr) {
//             console.error("Failed to load earnings:", xhr.responseText);
//         }
//     });
//
//     // Load payout history
//     $.ajax({
//         url: "http://localhost:8080/admin/payouts", // API endpoint
//         method: "GET",
//         headers: { "Authorization": `Bearer ${token}` },
//         success: function (payouts) {
//             const container = $(".payout-history-container");
//             container.empty();
//             if (Array.isArray(payouts) && payouts.length > 0) {
//                 payouts.forEach(p => {
//                     container.append(`
//                         <div class="flex items-center justify-between p-3 rounded-lg bg-background-light dark:bg-primary/10">
//                             <div>
//                                 <p class="font-medium">Payout #${p.id}</p>
//                                 <p class="text-sm text-stone-500 dark:text-stone-400">${p.status}</p>
//                             </div>
//                             <p class="font-medium">${p.amount} Coins</p>
//                         </div>
//                     `);
//                 });
//             } else {
//                 container.append(`<p class="text-stone-500 dark:text-stone-400">No payouts found</p>`);
//             }
//         },
//         error: function (xhr) {
//             console.error("Failed to load payouts:", xhr.responseText);
//         }
//     });
// }

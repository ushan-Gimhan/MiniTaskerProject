$(document).ready(async function () {
    const apiBaseURL = "http://localhost:8080/wallet"; // Wallet API base
    const token = localStorage.getItem('jwtToken');

    if (!token) {
        console.error("❌ No JWT token found. Please login.");
        $(".balance-amount").text("$0");
        $(".transaction-list").html("<p class='text-red-500'>Please login to view wallet info.</p>");
        return;
    }

    // Load user info from JWT
    const user = await loadUserDetails(token).catch(err => {
        console.error(err);
        $(".transaction-list").html("<p class='text-red-500'>Failed to fetch user info.</p>");
        return null;
    });

    if (!user) return;
    const userId = user.id;

    // ---------------- Load Wallet ----------------
    async function loadWallet() {
        try {
            const wallet = await $.ajax({
                url: `${apiBaseURL}/${userId}`, // API expects /wallet/{userId}
                type: "GET",
                dataType: "json",
                headers: { "Authorization": `Bearer ${token}` },
            });

            // Update balance
            $(".balance-amount").text(`$${(wallet.balance ?? 0).toLocaleString()}`);

            const transactions = wallet.transactions || [];

            // Stats
            const totalEarned = transactions.filter(tx => tx.amount > 0).reduce((sum, tx) => sum + tx.amount, 0);
            const totalWithdrawn = transactions.filter(tx => tx.amount < 0).reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
            const tasksCompleted = transactions.filter(tx => tx.type === "earned").length;

            $(".stat-card").eq(0).find(".stat-value").text(totalEarned.toLocaleString());
            $(".stat-card").eq(1).find(".stat-value").text(totalWithdrawn.toLocaleString());
            $(".stat-card").eq(2).find(".stat-value").text(tasksCompleted);

            // Render transactions
            renderTransactions(transactions);
        } catch (err) {
            console.error("❌ Failed to load wallet:", err);
            $(".transaction-list").html("<p class='text-red-500'>Failed to load wallet info.</p>");
        }
    }

    // ---------------- Render Transactions ----------------
    function renderTransactions(transactions) {
        const list = $(".transaction-list");
        list.empty();

        if (!Array.isArray(transactions) || transactions.length === 0) {
            list.html("<p class='text-gray-500'>No transactions found.</p>");
            return;
        }

        transactions.forEach(tx => {
            const amountClass = tx.amount > 0 ? "positive" : "negative";

            // Map type to icon
            let icon = "💰"; // earned default
            if (tx.type === "withdrawal") icon = "💸";
            else if (tx.type === "bonus") icon = "🎁";

            // Map status to class
            let statusClass = "status-completed";
            if (tx.status?.toLowerCase() === "rejected") statusClass = "status-rejected";
            else if (tx.status?.toLowerCase() === "processing") statusClass = "status-processing";

            const dateText = tx.timestamp ? timeAgo(tx.timestamp) : (tx.date ? new Date(tx.date).toLocaleString() : "");

            const txHTML = `
                <div class="transaction-item">
                    <div class="transaction-left">
                        <div class="transaction-icon ${tx.type}">${icon}</div>
                        <div class="transaction-info">
                            <h4>${tx.title || "No Title"}</h4>
                            <p>${tx.description || "No Description"}</p>
                            <span class="transaction-date">${dateText}</span>
                        </div>
                    </div>
                    <div class="transaction-right">
                        <div class="transaction-amount ${amountClass}">${tx.amount > 0 ? "+" : ""}${tx.amount ?? 0} Coins</div>
                        <span class="status-badge ${statusClass}">${capitalizeFirstLetter(tx.status ?? "Unknown")}</span>
                    </div>
                </div>
            `;
            list.append(txHTML);
        });
    }

    // ---------------- Helper: Time Ago ----------------
    function timeAgo(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diff = Math.floor((now - date) / 1000);

        if (diff < 60) return `${diff}s ago`;
        if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
        if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
        return `${Math.floor(diff / 86400)}d ago`;
    }

    // ---------------- Helper: Capitalize ----------------
    function capitalizeFirstLetter(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    // ---------------- Load User Details ----------------
    async function loadUserDetails(token) {
        return new Promise((resolve, reject) => {
            $.ajax({
                url: "http://localhost:8080/auth/user",
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                success: function (user) {
                    if (!user?.id) reject(new Error("Invalid user data from server"));
                    else resolve(user);
                },
                error: function (xhr, status, error) {
                    console.error("loadUserDetails error:", status, error, xhr.responseText);
                    reject(new Error(`Failed to fetch user details (status ${xhr.status})`));
                }
            });
        });
    }

    // ---------------- Initial Load ----------------
    loadWallet();
});

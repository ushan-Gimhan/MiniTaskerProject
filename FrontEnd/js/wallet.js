$(document).ready(async function () {
    const apiBaseURL = "http://localhost:8080/wallet"; // Wallet API base
    const token = localStorage.getItem('jwtToken');

    if (!token) {
        console.error("❌ No JWT token found. Please login.");
        $(".balance-amount").text("0");
        $(".transaction-list").html("<p class='text-red-500'>Please login to view wallet info.</p>");
        return;
    }

    // Load user info from JWT
    const user = await loadUserDetails(token);
    console.log("Logged in user:", user);

    const userId = user.id;

    async function loadWallet() {
        try {
            const wallet = await $.ajax({
                url: `${apiBaseURL}/${userId}`, // API expects /wallet/user/{id}
                type: "GET",
                dataType: "json",
                headers: { "Authorization": `Bearer ${token}` },
            });

            console.log("✅ Wallet data:", wallet);

            // Update balance
            $(".balance-amount").text(
                `$${(wallet.balance ?? 0).toLocaleString()}`
            );


            // Stats
            const totalEarned = wallet.transactions
                .filter(tx => tx.amount > 0).reduce((sum, tx) => sum + tx.amount, 0);
            const totalWithdrawn = wallet.transactions
                .filter(tx => tx.amount < 0).reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
            const tasksCompleted = wallet.transactions.filter(tx => tx.type === "earned").length;

            $(".stat-card").eq(0).find(".stat-value").text(totalEarned.toLocaleString());
            $(".stat-card").eq(1).find(".stat-value").text(totalWithdrawn.toLocaleString());
            $(".stat-card").eq(2).find(".stat-value").text(tasksCompleted);

            renderTransactions(wallet.transactions);
        } catch (err) {
            console.error("❌ Failed to load wallet:", err);
            $(".transaction-list").html("<p class='text-red-500'>Failed to load wallet info.</p>");
        }
    }

    function renderTransactions(transactions) {
        const list = $(".transaction-list");
        list.empty();

        if (!Array.isArray(transactions) || transactions.length === 0) {
            list.html("<p class='text-gray-500'>No transactions found.</p>");
            return;
        }

        transactions.forEach(tx => {
            const amountClass = tx.amount > 0 ? "positive" : "negative";
            const statusClass = `status-${tx.status.toLowerCase()}`;

            const txItem = $(`
                <div class="transaction-item">
                    <div class="transaction-left">
                        <div class="transaction-icon ${tx.type}">${tx.icon}</div>
                        <div class="transaction-info">
                            <h4>${tx.title}</h4>
                            <p>${tx.description}</p>
                            <span class="transaction-date">${new Date(tx.date).toLocaleString()}</span>
                        </div>
                    </div>
                    <div class="transaction-right">
                        <div class="transaction-amount ${amountClass}">${tx.amount > 0 ? "+" : ""}${tx.amount} Coins</div>
                        <span class="status-badge ${statusClass}">${tx.status}</span>
                    </div>
                </div>
            `);

            list.append(txItem);
        });
    }

    // Initial load
    loadWallet();
});
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
                if (!user || !user.username) reject(new Error("Invalid user data from server"));
                else resolve(user);
            },
            error: function (xhr, status, error) {
                console.error("loadUserDetails error:", status, error, xhr.responseText);
                reject(new Error(`Failed to fetch user details (status ${xhr.status})`));
            }
        });
    });
}
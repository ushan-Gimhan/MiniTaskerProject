let selectedAccountType = '';
let currentBalance = 12500;

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

// --------------------- Load and Update Balance Modal ---------------------
async function loadUserBalance(token) {
    try {
        const user = await loadUserDetails(token);

        // Assuming user.wallet.balance contains the balance
        const balance = user.wallet?.balance || 0;
        currentBalance=balance;


        // Update modal elements
        const balanceValueEl = document.querySelector('.balance-value');
        const conversionRateEl = document.querySelector('.conversion-rate small');

        if (balanceValueEl) balanceValueEl.textContent = `${balance.toLocaleString()} USD`;
        if (conversionRateEl) conversionRateEl.textContent = `1 Coin = $${conversionRate.toFixed(2)} USD`;

    } catch (error) {
        console.error("Error loading user balance:", error);
    }
}

// --------------------- Call when page loads ---------------------
document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('jwtToken');
    if (token) loadUserBalance(token);
});

function closeWithdrawalModal() {
    document.getElementById('withdrawalModal').style.display = 'none';
    document.body.style.overflow = 'auto';
    resetWithdrawalForm();
}

function closeConfirmationModal() {
    document.getElementById('confirmationModal').style.display = 'none';
    document.body.style.overflow = 'auto';
}

function resetWithdrawalForm() {
    document.getElementById('withdrawAmount').value = '';
    document.getElementById('usdAmount').textContent = '$0.00 USD';
    document.querySelectorAll('.account-option').forEach(option => {
        option.classList.remove('selected');
        option.querySelector('.account-radio').innerHTML = '';
    });
    document.getElementById('newAccountForm').style.display = 'none';
    selectedAccountType = '';
    updateWithdrawButton();
    updateFeeBreakdown(0);
}

function selectAccount(element, accountType) {
    selectedAccountType = accountType;

    // Remove selection from all accounts
    document.querySelectorAll('.account-option').forEach(option => {
        option.classList.remove('selected');
        option.querySelector('.account-radio').innerHTML = '';
    });

    // Select clicked account
    element.classList.add('selected');
    element.querySelector('.account-radio').innerHTML = '✓';

    // Show/hide new account form
    const newAccountForm = document.getElementById('newAccountForm');
    if (accountType === 'new') {
        newAccountForm.style.display = 'block';
    } else {
        newAccountForm.style.display = 'none';
    }

    updateWithdrawButton();
}

function calculateUSD() {
    const amount = parseInt(document.getElementById('withdrawAmount').value) || 0;
    const usdValue = (amount * 0.01).toFixed(2);
    document.getElementById('usdAmount').textContent = `${usdValue} USD`;
    updateFeeBreakdown(amount);
    updateWithdrawButton();
}

function setMaxAmount() {
    document.getElementById('withdrawAmount').value = currentBalance;
    calculateUSD();
}

function updateFeeBreakdown(amount) {
    const processingFee = Math.ceil(amount * 0.02); // 2% fee
    const totalDeducted = amount + processingFee;
    const youReceive = (amount - processingFee).toFixed(2); // correct amount user receives

    document.getElementById('feeWithdrawal').textContent = `${amount.toFixed(2)} USD`;
    document.getElementById('feeProcessing').textContent = `${processingFee.toFixed(2)} USD`;
    // document.getElementById('feeTotal').textContent = `${totalDeducted.toFixed(2)} USD`;
    document.getElementById('feeReceived').textContent = `${youReceive} USD`;
}

function updateWithdrawButton() {
    const amount = parseInt(document.getElementById('withdrawAmount').value) || 0;
    const hasAccount = selectedAccountType;
    const isNewAccountValid =  validateNewAccountForm();

    const withdrawBtn = document.getElementById('withdrawBtn');

    if (amount >= 5 && amount <= currentBalance && hasAccount && isNewAccountValid) {
        withdrawBtn.classList.add('enabled');
        withdrawBtn.textContent = 'Review Withdrawal';
    } else {
        withdrawBtn.classList.remove('enabled');
        if (amount < 5) {
            withdrawBtn.textContent = 'Minimum 5 USD';
        } else if (amount > currentBalance) {
            withdrawBtn.textContent = 'Insufficient Balance';
        } else if (!hasAccount) {
            withdrawBtn.textContent = 'Select Account';
        } else {
            withdrawBtn.textContent = 'Complete Account Details';
        }
    }
}

function validateNewAccountForm() {
    if (selectedAccountType !== 'new') return true;

    const accountHolder = document.getElementById('accountHolder').value.trim();
    const bankName = document.getElementById('bankName').value;
    const routingNumber = document.getElementById('routingNumber').value.trim();
    const accountNumber = document.getElementById('accountNumber').value.trim();


    return accountHolder && bankName && routingNumber &&
        accountNumber.length >= 8;
}

function formatRoutingNumber(input) {
    input.value = input.value.replace(/\D/g, '');
    updateWithdrawButton();
}

function processWithdrawal() {
    // Get withdrawal details
    const amount = parseInt(document.getElementById('withdrawAmount').value);
    if (isNaN(amount) || amount <= 0) return alert("Enter a valid amount");

    const processingFee = Math.ceil(amount * 0.02);
    const totalDeducted = amount + processingFee;
    const youReceive = ((amount - processingFee) * 0.01).toFixed(2);

    // Update confirmation modal
    document.getElementById('confirmAmount').textContent = `${amount} USD`;
    document.getElementById('confirmFee').textContent = `${processingFee} USD`;
    document.getElementById('confirmReceived').textContent = `${youReceive} USD`;

    // Set bank account info
    let bankInfo = 'Chase Bank ****1234';
    if (selectedAccountType === 'new') {
        const bankName = document.getElementById('bankName').value;
        const accountNumber = document.getElementById('accountNumber').value;
        const last4 = accountNumber.slice(-4);
        bankInfo = `${bankName} ****${last4}`;
    }
    document.getElementById('confirmBank').textContent = bankInfo;

    // Show confirmation modal
    document.getElementById('withdrawalModal').style.display = 'none';
    document.getElementById('confirmationModal').style.display = 'flex';
}

function showWithdrawalSuccess() {
    // Create success modal
    const successHtml = `
                <div id="withdrawalSuccessModal" class="modal-overlay">
                    <div class="modal-container">
                        <div class="success-modal">
                            <div class="success-icon">💸</div>
                            <h3 class="success-title">Withdrawal Submitted!</h3>
                            <p class="success-message">Your withdrawal request has been submitted successfully. You'll receive the funds in 1-3 business days.</p>
                            <div style="background: #f0f9ff; padding: 15px; border-radius: 10px; margin: 20px 0; text-align: left;">
                                <p style="margin: 5px 0; color: #0c4a6e;"><strong>Reference ID:</strong> WD${Date.now()}</p>
                                <p style="margin: 5px 0; color: #0c4a6e;"><strong>Status:</strong> Processing</p>
                                <p style="margin: 5px 0; color: #0c4a6e;"><strong>Estimated Arrival:</strong> ${getBusinessDate(3)}</p>
                            </div>
                            <button class="btn-continue" onclick="closeWithdrawalSuccess()">Back to Wallet</button>
                        </div>
                    </div>
                </div>
            `;
    document.body.insertAdjacentHTML('beforeend', successHtml);
}

function closeWithdrawalSuccess() {
    document.getElementById('withdrawalSuccessModal').remove();
    document.body.style.overflow = 'auto';
}

function getBusinessDate(days) {
    const date = new Date();
    let businessDays = 0;

    while (businessDays < days) {
        date.setDate(date.getDate() + 1);
        if (date.getDay() !== 0 && date.getDay() !== 6) { // Not weekend
            businessDays++;
        }
    }

    return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function showTerms() {
    const termsHtml = `
                <div id="termsModal" class="modal-overlay">
                    <div class="modal-container">
                        <div class="modal-header">
                            <button class="close-btn" onclick="closeTermsModal()">&times;</button>
                            <div class="modal-icon">📋</div>
                            <h3 class="modal-title">Withdrawal Terms & Conditions</h3>
                        </div>
                        <div class="modal-body" style="max-height: 400px; overflow-y: auto;">
                            <h4>Withdrawal Policy</h4>
                            <ul style="margin: 15px 0; padding-left: 20px; color: #374151;">
                                <li>Minimum withdrawal amount: 100 coins</li>
                                <li>Processing fee: 2% of withdrawal amount</li>
                                <li>Processing time: 1-3 business days</li>
                                <li>Maximum daily withdrawal: 50,000 coins</li>
                            </ul>

                            <h4>Bank Account Requirements</h4>
                            <ul style="margin: 15px 0; padding-left: 20px; color: #374151;">
                                <li>Account must be in your legal name</li>
                                <li>US bank accounts only</li>
                                <li>Account verification may be required</li>
                                <li>Shared or business accounts not permitted</li>
                            </ul>

                            <h4>Security & Privacy</h4>
                            <ul style="margin: 15px 0; padding-left: 20px; color: #374151;">
                                <li>Bank details are encrypted using AES-256</li>
                                <li>We never store complete account numbers</li>
                                <li>All transactions are logged and monitored</li>
                                <li>Suspicious activity may trigger additional verification</li>
                            </ul>

                            <div class="modal-actions">
                                <button class="btn-continue" onclick="closeTermsModal()">I Understand</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
    document.body.insertAdjacentHTML('beforeend', termsHtml);
}

function closeTermsModal() {
    document.getElementById('termsModal').remove();
}

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    // Add event listeners for new account form validation
    const newAccountInputs = ['accountHolder', 'bankName', 'routingNumber', 'accountNumber', 'accountType'];
    newAccountInputs.forEach(inputId => {
        const element = document.getElementById(inputId);
        if (element) {
            element.addEventListener('input', updateWithdrawButton);
            element.addEventListener('change', updateWithdrawButton);
        }
    });

    // Terms checkbox functionality
    document.addEventListener('change', function(e) {
        if (e.target.id === 'agreeTerms') {
            const confirmBtn = document.getElementById('confirmBtn');
            if (e.target.checked) {
                confirmBtn.classList.add('enabled');
            } else {
                confirmBtn.classList.remove('enabled');
            }
        }
    });

    // Close modal when clicking outside
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal-overlay')) {
            if (e.target.id === 'withdrawalModal') closeWithdrawalModal();
            if (e.target.id === 'confirmationModal') closeConfirmationModal();
            if (e.target.id === 'withdrawalSuccessModal') closeWithdrawalSuccess();
            if (e.target.id === 'termsModal') closeTermsModal();
        }
    });

    // Prevent form submission on Enter key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && e.target.tagName === 'INPUT') {
            e.preventDefault();
        }
    });
});

// Input validation and formatting
document.getElementById('accountNumber').addEventListener('input', function(e) {
    // Only allow numbers
    e.target.value = e.target.value.replace(/\D/g, '');
    updateWithdrawButton();
});

document.getElementById('accountHolder').addEventListener('input', function(e) {
    // Only allow letters and spaces
    e.target.value = e.target.value.replace(/[^a-zA-Z\s]/g, '');
    updateWithdrawButton();
});

async function submitWithdrawal() {
    const confirmBtn = document.getElementById('confirmBtn');
    if (!confirmBtn) return console.error('Confirm button not found');

    const withdrawInput = document.getElementById('withdrawAmount');
    if (!withdrawInput) return console.error('Withdraw amount input not found');

    const withdrawAmount = parseInt(withdrawInput.value);
    if (isNaN(withdrawAmount) || withdrawAmount <= 0) return alert('Enter a valid amount');

    const agreeTerms = document.getElementById('agreeTerms')?.checked;
    if (!agreeTerms) return alert('Please agree to the terms and conditions');

    confirmBtn.textContent = 'Processing...';
    confirmBtn.style.opacity = '0.7';
    confirmBtn.style.pointerEvents = 'none';

    const processingFee = Math.ceil(withdrawAmount * 0.02);
    const totalDeducted = withdrawAmount + processingFee;

    const token = localStorage.getItem('jwtToken');
    const user = await loadUserDetails(token);

    const payload = {
        user:user,
        amount: withdrawAmount,
        status: 'PENDING',
        requestedAt: new Date().toISOString(),
        processedAt: null
    };

    if (selectedAccountType === 'new') {
        payload.bankName = document.getElementById('bankName')?.value;
        payload.accountNumber = document.getElementById('accountNumber')?.value;
        payload.accountHolderName = document.getElementById('accountHolder')?.value;
        payload.routingNumber = document.getElementById('routingNumber')?.value;
    } else {
        payload.bankName = 'Chase Bank';
        payload.accountNumber = '****1234';
    }

    try {
        const response = await fetch('http://localhost:8080/payouts/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) throw new Error('Failed to submit withdrawal request');

        const result = await response.json();
        console.log('Withdrawal saved:', result);

        if (typeof currentBalance === 'number') {
            currentBalance -= totalDeducted;
            const balanceEl = document.getElementById('currentBalance');
            if (balanceEl) balanceEl.textContent = currentBalance.toLocaleString();
        }

        closeConfirmationModal?.();
        showWithdrawalSuccess?.(result);

    } catch (error) {
        console.error(error);
        alert('Error: ' + error.message);
        confirmBtn.textContent = 'Confirm Withdrawal';
        confirmBtn.style.opacity = '1';
        confirmBtn.style.pointerEvents = 'auto';
    }
}

document.getElementById('withdrawAmount').addEventListener('input', function() {
    const btn = document.getElementById('withdrawBtn');
    if (this.value > 0) btn.classList.add('enabled');
    else btn.classList.remove('enabled');
});
// Function to add the new account dynamically
document.getElementById('addAccountBtn').addEventListener('click', function() {
    const accountNumber = document.getElementById('accountNumber').value.trim();
    const routingNumber = document.getElementById('routingNumber').value.trim();

    if (!accountNumber || !routingNumber) {
        alert("Please fill in both Account Number and Branch.");
        return;
    }

    // Mask the account number except last 4 digits
    const maskedAccount = `****${accountNumber.slice(-4)}`;

    // Create a new account option div
    const newAccountDiv = document.createElement('div');
    newAccountDiv.className = 'account-option';
    newAccountDiv.setAttribute('data-account', accountNumber);
    newAccountDiv.setAttribute('onclick', `selectAccount(this, '${accountNumber}')`);
    newAccountDiv.innerHTML = `
        <div class="account-radio"></div>
        <div class="account-info">
            <div class="account-details">
                <h4>${maskedAccount}</h4>
                <p>${routingNumber}</p>
            </div>
        </div>
    `;

    // Add the new account above the "Add New Account" button
    const container = document.getElementById('accountOptionsContainer');
    const addNewOption = container.querySelector('[data-account="new"]');
    container.insertBefore(newAccountDiv, addNewOption);

    // Clear input fields
    document.getElementById('accountNumber').value = '';
    document.getElementById('routingNumber').value = '';
});





// ------------------ Load Job Data ------------------
document.addEventListener("DOMContentLoaded", () => {
    const jobData = JSON.parse(sessionStorage.getItem("pendingJobData"));

    if (jobData) {
        // Fill Job Summary
        document.querySelector(".summary-card").innerHTML = `
      <div class="summary-item"><strong>Title:</strong> ${jobData.title}</div>
      <div class="summary-item"><strong>Category:</strong> ${jobData.category || "General"}</div>
      <div class="summary-item"><strong>Quantity:</strong> ${jobData.totalQuantity} tasks</div>
      <div class="summary-item"><strong>Reward per task:</strong> $${jobData.totalPrice.toFixed(2)}</div>
    `;

        // Cost Breakdown
        const baseAmount = jobData.totalPrice;
        const serviceFee = baseAmount * 0.05;
        const totalAmount = baseAmount + serviceFee;

        document.querySelector(".cost-breakdown").innerHTML = `
      <h4 class="section-title">💰 Cost Breakdown</h4>
      <div class="cost-item">
        <span>Base Amount (${jobData.totalQuantity} × $${jobData.rewardPerTask.toFixed(2)}):</span>
        <span class="cost-value">$${baseAmount.toFixed(2)}</span>
      </div>
      <div class="cost-item">
        <span>Service Fee (5%):</span>
        <span class="cost-value">$${serviceFee.toFixed(2)}</span>
      </div>
      <hr class="cost-divider">
      <div class="total-cost">
        <span class="total-label">Total Amount:</span>
        <span class="total-amount">$${totalAmount.toFixed(2)}</span>
      </div>
    `;

        // Store total for later
        sessionStorage.setItem("paymentTotal", totalAmount.toFixed(2));
    }
});
let selectedPaymentMethod = null;

function showPaymentModal() {
    document.getElementById('paymentModal').style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function closePaymentModal() {
    document.getElementById('paymentModal').style.display = 'none';
    document.body.style.overflow = 'auto';
    resetSelection();
}

function selectPaymentMethod(element, method) {
    selectedPaymentMethod = method;
    selectedMethod = method; // store for OTP / backend

    // reset other UI highlights
    document.querySelectorAll('.payment-option').forEach(option => {
        option.classList.remove('selected');
        option.querySelector('.payment-radio').innerHTML = '';
    });

    // hide card form first
    document.getElementById('cardDetailsForm').style.display = 'none';

    // highlight selected option
    element.classList.add('selected');
    element.querySelector('.payment-radio').innerHTML = '✓';

    if (method === 'card') {
        document.getElementById('cardDetailsForm').style.display = 'block';
        const proceedBtn = document.getElementById('proceedBtn');
        proceedBtn.classList.remove('enabled');
        proceedBtn.textContent = 'Enter Card Details';
        validateCardForm();
    } else {
        const proceedBtn = document.getElementById('proceedBtn');
        proceedBtn.classList.add('enabled');
        proceedBtn.textContent = 'Proceed to Payment';
    }
}

function processPayment() {
    if (!selectedPaymentMethod) return;

    const proceedBtn = document.getElementById('proceedBtn');

    if (selectedPaymentMethod === 'card') {
        if (!validateCardForm()) {
            showCardError('Please fill in all card details correctly');
            return;
        }

        proceedBtn.textContent = 'Processing Card...';
        proceedBtn.style.opacity = '0.7';
        proceedBtn.style.pointerEvents = 'none';
        proceedBtn.classList.add('processing');

        // Simulate card processing and show OTP
        setTimeout(() => {
            closePaymentModal();
            showOTPModal();
        }, 2000);
    } else {
        // Handle other payment methods
        const originalText = proceedBtn.textContent;
        proceedBtn.textContent = 'Processing...';
        proceedBtn.style.opacity = '0.7';
        proceedBtn.style.pointerEvents = 'none';

        setTimeout(() => {
            closePaymentModal();
            showSuccessModal();
        }, 2000);
    }
}

// Card form validation and formatting
function formatCardNumber(input) {
    let value = input.value.replace(/\D/g, '');
    let formattedValue = value.replace(/(\d{4})(?=\d)/g, '$1 ');

    if (formattedValue.length <= 19) {
        input.value = formattedValue;
    }
    validateCardForm();
}

function formatExpiryDate(input) {
    let value = input.value.replace(/\D/g, '');
    if (value.length >= 2) {
        value = value.substring(0, 2) + '/' + value.substring(2, 4);
    }
    input.value = value;
    validateCardForm();
}

function formatCVV(input) {
    input.value = input.value.replace(/\D/g, '');
    validateCardForm();
}

function validateCardForm() {
    if (selectedPaymentMethod !== 'card') return true;

    const cardNumber = document.getElementById('cardNumber').value.replace(/\s/g, '');
    const expiryDate = document.getElementById('expiryDate').value;
    const cvv = document.getElementById('cvv').value;
    const cardName = document.getElementById('cardName').value.trim();

    const isCardNumberValid = cardNumber.length >= 13 && cardNumber.length <= 19;
    const isExpiryValid = /^(0[1-9]|1[0-2])\/([0-9]{2})$/.test(expiryDate);
    const isCVVValid = cvv.length >= 3 && cvv.length <= 4;
    const isNameValid = cardName.length >= 2;

    // Update field styles
    updateFieldValidation('cardNumber', isCardNumberValid);
    updateFieldValidation('expiryDate', isExpiryValid);
    updateFieldValidation('cvv', isCVVValid);
    updateFieldValidation('cardName', isNameValid);

    const allValid = isCardNumberValid && isExpiryValid && isCVVValid && isNameValid;

    const proceedBtn = document.getElementById('proceedBtn');
    proceedBtn.classList.add('enabled');
    // if (allValid) {
    //     proceedBtn.classList.add('enabled');
    //     proceedBtn.textContent = 'Proceed to Payment';
    // } else {
    //     proceedBtn.classList.remove('enabled');
    //     proceedBtn.textContent = 'Enter Card Details';
    // }

    return allValid;
}

function updateFieldValidation(fieldId, isValid) {
    const field = document.getElementById(fieldId);
    if (field.value.length > 0) {
        if (isValid) {
            field.classList.remove('error');
            field.style.borderColor = '#10b981';
        } else {
            field.classList.add('error');
        }
    } else {
        field.classList.remove('error');
        field.style.borderColor = '#e2e8f0';
    }
}

function showCardError(message) {
    let errorDiv = document.getElementById('cardError');
    if (!errorDiv) {
        errorDiv = document.createElement('div');
        errorDiv.id = 'cardError';
        errorDiv.style.cssText = `
                    margin-top: 15px;
                    padding: 12px;
                    background: #fee2e2;
                    color: #dc2626;
                    border-radius: 8px;
                    font-weight: 600;
                    text-align: center;
                `;
        document.getElementById('cardDetailsForm').appendChild(errorDiv);
    }
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';

    setTimeout(() => {
        errorDiv.style.display = 'none';
    }, 5000);
}

// OTP Modal functions
function showOTPModal() {
    document.getElementById('otpModal').style.display = 'flex';
    document.querySelector('.otp-input').focus();
    startResendTimer();
}

function closeOTPModal() {
    document.getElementById('otpModal').style.display = 'none';
    clearOTPInputs();
    clearResendTimer();
}

function moveToNext(current, index) {
    if (current.value.length === 1) {
        current.classList.add('filled');
        if (index < 5) {
            document.querySelectorAll('.otp-input')[index + 1].focus();
        }
        checkOTPComplete();
    }
}

function moveToPrev(current, event) {
    if (event.key === 'Backspace' && current.value.length === 0) {
        const inputs = document.querySelectorAll('.otp-input');
        const currentIndex = Array.from(inputs).indexOf(current);
        if (currentIndex > 0) {
            const prevInput = inputs[currentIndex - 1];
            prevInput.focus();
            prevInput.value = '';
            prevInput.classList.remove('filled');
        }
    }
    checkOTPComplete();
}

function checkOTPComplete() {
    const inputs = document.querySelectorAll('.otp-input');
    const otp = Array.from(inputs).map(input => input.value).join('');
    const verifyBtn = document.getElementById('verifyOTPBtn');

    if (otp.length === 6) {
        verifyBtn.classList.add('enabled');
    } else {
        verifyBtn.classList.remove('enabled');
    }
}
function showOTPError(message) {
    const errorDiv = document.getElementById('otpError');
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';

    setTimeout(() => {
        errorDiv.style.display = 'none';
    }, 5000);
}

function clearOTPInputs() {
    document.querySelectorAll('.otp-input').forEach(input => {
        input.value = '';
        input.classList.remove('filled', 'error');
    });
}

let resendTimer;
let resendCountdown = 30;

function startResendTimer() {
    const resendBtn = document.getElementById('resendOTP');
    const timerSpan = document.getElementById('resendTimer');

    resendBtn.style.display = 'none';
    timerSpan.style.display = 'inline';

    resendTimer = setInterval(() => {
        timerSpan.textContent = `(${resendCountdown}s)`;
        resendCountdown--;

        if (resendCountdown < 0) {
            clearResendTimer();
            resendBtn.style.display = 'inline';
            timerSpan.style.display = 'none';
            resendCountdown = 30;
        }
    }, 1000);
}

function clearResendTimer() {
    if (resendTimer) {
        clearInterval(resendTimer);
        resendTimer = null;
    }
}

function resendOTP() {
    // Simulate resending OTP
    const resendBtn = document.getElementById('resendOTP');
    resendBtn.textContent = 'Sending...';
    resendBtn.style.pointerEvents = 'none';

    setTimeout(() => {
        resendBtn.textContent = 'Resend OTP';
        resendBtn.style.pointerEvents = 'auto';
        startResendTimer();

        // Show success message
        showOTPError = function(msg) {
            const errorDiv = document.getElementById('otpError');
            errorDiv.style.background = '#dcfce7';
            errorDiv.style.color = '#166534';
            errorDiv.textContent = '✅ New OTP sent successfully';
            errorDiv.style.display = 'block';

            setTimeout(() => {
                errorDiv.style.display = 'none';
                errorDiv.style.background = '#fee2e2';
                errorDiv.style.color = '#dc2626';
            }, 3000);
        };
        showOTPError();
    }, 1500);
}

function showSuccessModal() {
    document.getElementById('successModal').style.display = 'flex';
}

function closeSuccessModal() {
    document.getElementById('successModal').style.display = 'none';
    document.body.style.overflow = 'auto';
    // Reset selected payment options or any other selections
    resetSelection();

    // Redirect to task.html
    window.location.href = 'task.html';
}

// reset UI only, optionally reset the method
function resetSelection(clearMethod = false) {
    if (clearMethod) selectedPaymentMethod = null;

    document.querySelectorAll('.payment-option').forEach(option => {
        option.classList.remove('selected');
        option.querySelector('.payment-radio').innerHTML = '';
    });

    const proceedBtn = document.getElementById('proceedBtn');
    proceedBtn.classList.remove('enabled');
    proceedBtn.textContent = 'Proceed to Payment';
    proceedBtn.style.opacity = '0.5';
    proceedBtn.style.pointerEvents = 'none';
}


// Close modal when clicking outside
document.getElementById('paymentModal').addEventListener('click', function(e) {
    if (e.target === this) {
        closePaymentModal();
    }
});

document.getElementById('successModal').addEventListener('click', function(e) {
    if (e.target === this) {
        closeSuccessModal();
    }
});

let selectedMethod = "balance"; // or 'card', 'paypal', etc. depending on selection

async function verifyOTP() {
    const otpInputs = document.querySelectorAll(".otp-input");
    const enteredOTP = Array.from(otpInputs).map(inp => inp.value).join("");

    const demoOTP = "123456"; // Demo OTP

    if (enteredOTP === demoOTP) {
        // Get pending job data
        const jobData = JSON.parse(sessionStorage.getItem("pendingJobData"));
        if (!jobData) {
            alert("No job data found!");
            return;
        }

        // Only e-wallet payment
        jobData.payments = [
            {
                method: "e-wallet",
                amount: parseFloat(sessionStorage.getItem("paymentTotal")) || 0,
                date: new Date().toISOString()
            }
        ];

        const token = localStorage.getItem("jwtToken");
        try {
            const response = await fetch("http://localhost:8080/task/create", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(jobData)
            });

            if (!response.ok) throw new Error(`Server error ${response.status}`);

            const data = await response.json();
            console.log("Server response:", data);

            // ✅ On success, redirect to task.html
            alert("Jon Create Successfully!!!");
            sessionStorage.clear();
            window.location.href = "task.html";

        } catch (err) {
            console.error("Error saving task:", err);
            const otpError = document.getElementById("otpError");
            otpError.style.display = "block";
            otpError.textContent = "Error connecting to server.";
        }
    } else {
        const otpError = document.getElementById("otpError");
        otpError.style.display = "block";
        otpError.textContent = "Invalid OTP. Enter 123456 for demo.";
    }
}


function GotoOTPModal(){
    window.location.href = "task.html";
}




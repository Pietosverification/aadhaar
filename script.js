// --- GLOBAL STATE & USER DATABASE ---
let userToken = localStorage.getItem('userToken');
let currentUser = null;

// PASTE YOUR NEW GOOGLE APPS SCRIPT WEB APP URL HERE
const GAS_URL = 'https://script.google.com/macros/s/AKfycbxh8qdrEByoHdQaFz-Vwc6wk3tlguFjLN2Jhq6qtZTUGeaCweSGTZlZ5oQY8JN2Oe2-VA/exec';

// Format Aadhaar number as user types (adds spaces)
function formatAadhaar(input) {
    let value = input.value.replace(/\D/g, ''); // Remove non-digits
    if (value.length > 12) value = value.substring(0, 12); // Limit to 12 digits
    
    // Format with spaces: XXXX XXXX XXXX
    let formattedValue = '';
    for (let i = 0; i < value.length; i++) {
        if (i === 4 || i === 8) {
            formattedValue += ' ';
        }
        formattedValue += value[i];
    }
    
    input.value = formattedValue;
}

// Verify Aadhaar function
async function verifyAadhaar() {
    const aadhaarInput = document.getElementById('aadhaarNumber');
    const verifyBtn = document.getElementById('verifyBtn');
    const messageDiv = document.getElementById('message');
    const resultContainer = document.getElementById('resultContainer');
    
    // Get and clean the Aadhaar number (remove spaces)
    const aadhaarNumber = aadhaarInput.value.replace(/\s/g, '');
    
    // Validate Aadhaar number
    if (!aadhaarNumber || aadhaarNumber.length !== 12 || isNaN(aadhaarNumber)) {
        messageDiv.className = 'message error';
        messageDiv.textContent = 'Please enter a valid 12-digit Aadhaar number';
        messageDiv.classList.remove('hidden');
        return;
    }
    
    // Check if user is logged in
    if (!userToken) {
        messageDiv.className = 'message error';
        messageDiv.textContent = 'Please login to verify Aadhaar';
        messageDiv.classList.remove('hidden');
        setTimeout(() => {
            openAuthModal('login');
        }, 1500);
        return;
    }
    
    // Show loading state
    verifyBtn.textContent = 'Verifying...';
    verifyBtn.disabled = true;
    messageDiv.classList.add('hidden');
    resultContainer.style.display = 'none';
    
    try {
        // In a real application, you would call your backend API here
        // For demo purposes, we'll simulate an API call with a timeout
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Simulate response based on Aadhaar number
        let response;
        if (aadhaarNumber.endsWith('0') || aadhaarNumber.endsWith('5')) {
            // Simulate invalid Aadhaar
            messageDiv.className = 'message error';
            messageDiv.textContent = 'Invalid Aadhaar number. Please check and try again.';
            messageDiv.classList.remove('hidden');
        } else {
            // Simulate successful verification
            const names = ['Rahul Sharma', 'Priya Patel', 'Amit Kumar', 'Sneha Singh', 'Vikram Malhotra'];
            const genders = ['Male', 'Female'];
            const states = ['Delhi', 'Maharashtra', 'Uttar Pradesh', 'Karnataka', 'West Bengal'];
            
            const name = names[Math.floor(Math.random() * names.length)];
            const gender = genders[Math.floor(Math.random() * genders.length)];
            const age = Math.floor(Math.random() * 40) + 18;
            const state = states[Math.floor(Math.random() * states.length)];
            const mobileLinked = Math.random() > 0.3 ? 'Yes' : 'No';
            
            // Update result display
            document.getElementById('resultAadhaarNumber').textContent = aadhaarInput.value;
            document.getElementById('resultStatus').textContent = 'Verified';
            document.getElementById('resultStatus').style.color = '#4CAF50';
            document.getElementById('resultName').textContent = name;
            document.getElementById('resultGender').textContent = gender;
            document.getElementById('resultAge').textContent = age + ' years';
            document.getElementById('resultState').textContent = state;
            document.getElementById('resultMobile').textContent = mobileLinked;
            document.getElementById('resultDate').textContent = new Date().toLocaleString();
            
            // Show result container
            resultContainer.style.display = 'block';
            
            // Show success message
            messageDiv.className = 'message success';
            messageDiv.textContent = 'Aadhaar verification successful!';
            messageDiv.classList.remove('hidden');
            
            // Log activity
            logUserActivity('Aadhaar Verification', `Verified Aadhaar: ${aadhaarInput.value}`);
        }
    } catch (error) {
        console.error('Error:', error);
        messageDiv.className = 'message error';
        messageDiv.textContent = 'An error occurred during verification. Please try again.';
        messageDiv.classList.remove('hidden');
    } finally {
        verifyBtn.textContent = 'Verify Aadhaar';
        verifyBtn.disabled = false;
    }
}

// --- AUTHENTICATION FUNCTIONS ---
function openAuthModal(mode) {
    // Redirect to index.html for authentication
    window.location.href = 'index.html';
}

function showDashboard() {
    if (!userToken) {
        openAuthModal('login');
    } else {
        // Redirect to index.html and show dashboard
        window.location.href = 'index.html';
        // The dashboard functionality will be handled on index.html
    }
}

function logout() {
    userToken = null;
    currentUser = null;
    localStorage.removeItem('userToken');
    updateAuthUI();
    
    const message = document.createElement('div');
    message.className = 'message success';
    message.textContent = 'Logged out successfully!';
    message.style.position = 'fixed';
    message.style.top = '100px';
    message.style.right = '20px';
    message.style.zIndex = '3000';
    document.body.appendChild(message);
    setTimeout(() => { message.remove(); }, 3000);
}

function updateAuthUI() {
    const authButtons = document.getElementById('authButtons');
    const userInfo = document.getElementById('userInfo');
    const userName = document.getElementById('userName');
    
    if (userToken) {
        try {
            const payload = JSON.parse(atob(userToken.split('.')[1]));
            userName.textContent = payload.name;
            currentUser = payload;
            authButtons.style.display = 'none';
            userInfo.style.display = 'flex';
        } catch (e) {
            console.error("Failed to decode token", e);
            logout();
        }
    } else {
        authButtons.style.display = 'flex';
        userInfo.style.display = 'none';
    }
}

async function logUserActivity(eventType, details) {
    if (userToken) {
        try {
            const url = `${GAS_URL}?action=logActivity&token=${encodeURIComponent(userToken)}&eventType=${encodeURIComponent(eventType)}&details=${encodeURIComponent(details)}`;
            await fetch(url);
        } catch (error) {
            console.error('Error logging activity:', error);
        }
    }
}

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    updateAuthUI();
    
    // Allow pressing Enter to submit the form
    document.getElementById('aadhaarNumber').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            verifyAadhaar();
        }
    });
});
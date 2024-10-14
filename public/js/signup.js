// Helper function to make POST requests
async function postData(url = "", data = {}) {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  return response.json(); // parses JSON response into native JavaScript objects
}

// Function to handle sending verification email and start the countdown
function sendVerificationEmail() {
  const email = document.getElementById("email").value;

  if (email) {
    // Call the generateCode API to send the verification code to the user's email
    postData("/api/verificationCode/generate", { email })
      .then((data) => {
        if (data.success) {
          alert(
            "Confirmation email sent. Please check your spam folder if you can't find it. The code must be used within 1 minute."
          );
          // Start the countdown for Resend Code
          startCountdown();
        } else {
          alert("Failed to send verification email. Please try again.");
        }
      })
      .catch((error) => console.error("Error:", error));
  } else {
    alert("Please enter a valid email address.");
  }
}

// Function to verify the entered code
function verifyCode() {
  const email = document.getElementById("email").value;
  const code = parseInt(document.getElementById("verification_code").value);

  if (email && code) {
    // Call the authenticateCode API to verify the code
    postData("/api/verificationCode/authenticate", {
      email,
      verificationCode: code,
    })
      .then((data) => {
        if (data.success) {
          // If verified, show the rest of the form and hide the email verification section
          document.getElementById("full-form-section").style.display = "block";
          document.getElementById("email-verification-section").style.display =
            "none";
        } else {
          alert("Verification failed. Please check your code and try again.");
        }
      })
      .catch((error) => console.error("Error:", error));
  } else {
    alert("Please enter the verification code to proceed.");
  }
}

// Function to enable Resend Code button after 10 seconds
function startCountdown() {
  const resendButton = document.getElementById("resend_code_button");
  const countdownTimer = document.getElementById("countdown_timer");

  let countdown = 60; // Countdown for 60 seconds for verification

  resendButton.disabled = true;

  const interval = setInterval(() => {
    countdownTimer.textContent = `You can resend the code in ${countdown} seconds...`;
    countdown--;

    if (countdown < 0) {
      clearInterval(interval);
      resendButton.disabled = false;
      countdownTimer.textContent = "";
    }
  }, 1000);
}

// Start the countdown and send verification email when Confirm button is clicked
document
  .getElementById("send_email_button")
  .addEventListener("click", sendVerificationEmail);

// Handle Resend Code button click
document
  .getElementById("resend_code_button")
  .addEventListener("click", function () {
    sendVerificationEmail(); // Resend verification code
    startCountdown(); // Restart countdown
  });

// Handle Verify Code button click
document
  .getElementById("verify_code_button")
  .addEventListener("click", verifyCode);

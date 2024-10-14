// ========== Packages ==========
require("dotenv").config();
const nodemailer = require("nodemailer");

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      service: process.env.SMTPService,
      auth: {
        user: process.env.SMTPUser, // Your email address (set in .env)
        pass: process.env.SMTPPassword, // Your email password (set in .env)
      },
    });
  }

  // Function to send the email with a verification code
  async sendVerificationEmail(recipientEmail, verificationCode) {
    // Define email options
    const mailOptions = {
      from: {
        address: process.env.SMTPUser, // sender address from environment variables
        name: "CarparkSG", // Company name
      },
      to: recipientEmail, // recipient's email
      subject: "Your CarparkSG Verification Code", // Subject line
      html: `
        <div style="font-family: Arial, sans-serif; color: #333;">
          <div style="text-align: center;">
            <img src="https://www.carparksg.com/img/CarparkSGLogo-Long-Light.png" alt="CarparkSG Logo" style="max-width: 150px;" />
          </div>
          <h1 style="color: #007bff; text-align: center;">Your Verification Code</h1>
          <p style="font-size: 16px;">Dear customer,</p>
          <p style="font-size: 16px;">
            Thank you for choosing CarparkSG. Your verification code is:
          </p>
          <p style="font-size: 24px; font-weight: bold; text-align: center; color: #28a745;">${verificationCode}</p>
          <p style="font-size: 16px;">
            Please use this code to complete your verification process. The code will expire in 1 minute.
          </p>
          <p style="font-size: 16px;">
            If you need any help, feel free to contact us via Telegram: @cheeguang.
          </p>
          <br />
          <p style="font-size: 14px; color: #888;">
            Best regards,<br />The CarparkSG Team
          </p>
        </div>`,
    };

    // Send the email
    try {
      const result = await this.transporter.sendMail(mailOptions);
      console.log("Email sent:", result);
      return result;
    } catch (error) {
      console.error("Error sending email:", error);
      throw new Error("Failed to send verification email");
    }
  }
}

module.exports = EmailService;

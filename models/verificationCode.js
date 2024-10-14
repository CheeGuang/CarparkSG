// ========== Packages ==========
const sql = require("mssql");
const dbConfig = require("../dbConfig");
const EmailService = require("./emailService"); // Import EmailService

class VerificationCode {
  constructor() {
    this.emailService = new EmailService(); // Initialize EmailService
  }

  // Function to generate and save verification code
  async generateAndSaveVerificationCode(email) {
    try {
      // Generate a random verification code between 100000 and 999999
      const verificationCode = Math.floor(100000 + Math.random() * 900000);
      const currentTimestamp = new Date();

      // Connect to the database
      const pool = await sql.connect(dbConfig);

      // Save verification code and timestamp in MSSQL
      const request = pool.request();
      request.input("Email", sql.NVarChar(255), email);
      request.input("VerificationCode", sql.Int, verificationCode);
      request.input("Timestamp", sql.DateTime2, currentTimestamp);

      const result = await request.execute("usp_add_verification_code");

      console.log("Stored procedure executed:", result.recordset);

      // Send the verification code via email using EmailService
      await this.emailService.sendVerificationEmail(email, verificationCode);

      // Return the generated code and timestamp
      return { verificationCode, timestamp: currentTimestamp };
    } catch (error) {
      console.error("Database operation failed:", error);
      throw new Error("Failed to generate and save verification code.");
    }
  }

  // Function to authenticate the verification code
  async authenticateVerificationCode(email, receivedCode) {
    try {
      // Connect to the database
      const pool = await sql.connect(dbConfig);

      // Fetch the verification code and timestamp using the stored procedure
      const request = pool.request();
      request.input("Email", sql.NVarChar(255), email);

      const result = await request.execute("usp_get_verification_code");

      // Check if the result contains any records
      if (result.recordset.length === 0) {
        throw new Error("No verification code found for this email.");
      }

      const {
        verification_code: VerificationCode,
        verification_code_timestamp: Timestamp,
      } = result.recordset[0];

      // Check if the provided code matches the stored one
      if (receivedCode !== VerificationCode) {
        throw new Error("Verification code does not match.");
      }

      // Check if the verification code was generated within the last 1 minute
      const now = new Date();
      const codeGeneratedTime = new Date(Timestamp);
      const timeDifference = (now - codeGeneratedTime) / 1000; // time difference in seconds

      if (timeDifference > 60) {
        throw new Error("Verification code has expired.");
      }

      return { success: true, message: "Verification code is valid." };
    } catch (error) {
      console.error("Verification code authentication failed:", error);
      throw new Error(
        error.message || "Failed to authenticate verification code."
      );
    }
  }
}

module.exports = VerificationCode;

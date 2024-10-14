// ========== Models ==========
const VerificationCode = require("../../models/verificationCode");

// ========== Controller ==========
class VerificationCodeController {
  // Generate and save verification code
  static async generateCode(req, res) {
    try {
      const { email } = req.body;

      // Check if email is provided
      if (!email) {
        return res.status(400).json({
          success: false,
          message: "Email is required.",
        });
      }

      // Instantiate the model
      const verificationCodeModel = new VerificationCode();

      // Generate and save the verification code
      const { verificationCode, timestamp } =
        await verificationCodeModel.generateAndSaveVerificationCode(email);

      res.status(200).json({
        success: true,
        message: "Verification code generated successfully.",
        verificationCode,
        timestamp,
      });
    } catch (error) {
      console.error(`Error in generateCode: ${error.message}`);
      res.status(500).json({
        success: false,
        message: "Failed to generate verification code.",
      });
    }
  }

  // Authenticate the verification code
  static async authenticateCode(req, res) {
    try {
      const { email, verificationCode } = req.body;

      // Check if both email and verification code are provided
      if (!email || !verificationCode) {
        return res.status(400).json({
          success: false,
          message: "Both email and verification code are required.",
        });
      }

      // Instantiate the model
      const verificationCodeModel = new VerificationCode();

      // Authenticate the verification code
      const result = await verificationCodeModel.authenticateVerificationCode(
        email,
        verificationCode
      );

      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      console.error(`Error in authenticateCode: ${error.message}`);
      res.status(500).json({
        success: false,
        message: "Failed to authenticate verification code.",
      });
    }
  }
}

// ========== Export ==========
module.exports = VerificationCodeController;

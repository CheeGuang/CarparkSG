// ========== Packages ==========
// Initialising express
const express = require("express");

// ========== Controllers ==========
// Initialising VerificationCodeController
const VerificationCodeController = require("./verificationCodeController");

// ========== Set-up ==========
// Initialising verificationCodeRoutes
const verificationCodeRoutes = express.Router();

// ========== Routes ==========
// Define routes for verification code
// Route to generate a verification code
verificationCodeRoutes.post(
  "/generate",
  VerificationCodeController.generateCode
);

// Route to authenticate a verification code
verificationCodeRoutes.post(
  "/authenticate",
  VerificationCodeController.authenticateCode
);

// ========== Export ==========
module.exports = verificationCodeRoutes;

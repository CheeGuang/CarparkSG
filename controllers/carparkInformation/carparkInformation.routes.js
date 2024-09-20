// ========== Packages ==========
// Initialising express
const express = require("express");

// ========== Controllers ==========
// Initialising CarparkInformationController
const CarparkInformationController = require("./carparkInformationController");

// ========== Set-up ==========
// Initialising carparkRoutes
const carparkRoutes = express.Router();

// ========== Routes ==========
// Define routes for carpark availability
carparkRoutes.get("/", CarparkInformationController.getCarparkInformation);

// ========== Export ==========
module.exports = carparkRoutes;

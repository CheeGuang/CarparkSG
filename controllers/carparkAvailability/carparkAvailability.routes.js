// ========== Packages ==========
// Initialising express
const express = require("express");

// ========== Controllers ==========
// Initialising CarparkController
const CarparkController = require("../carparkAvailability/carparkAvailabilityController");

// ========== Set-up ==========
// Initialising carparkRoutes
const carparkRoutes = express.Router();

// ========== Routes ==========
// Define routes for carpark availability
carparkRoutes.get("/", CarparkController.getCarparkAvailability);

// ========== Export ==========
module.exports = carparkRoutes;

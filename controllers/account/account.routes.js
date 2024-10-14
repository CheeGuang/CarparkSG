// ========== Packages ==========
// Initialising express
const express = require("express");

// ========== Controllers ==========
// Initialising CarparkAvailabilityController
const CarparkAvailabilityController = require("./carparkAvailabilityController");

// ========== Set-up ==========
// Initialising carparkRoutes
const carparkRoutes = express.Router();

// ========== Routes ==========
// Define routes for carpark availability
carparkRoutes.get("/", CarparkAvailabilityController.getCarparkAvailability);

// ========== Export ==========
module.exports = carparkRoutes;

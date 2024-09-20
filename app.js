// ========== Packages ==========
// Initialising dotenv
require("dotenv").config();
// Initialising express
const express = require("express");
// Initialising path
const path = require("path");
// Initialising carparkAvailability Routes
const carparkAvailabilityRoutes = require("./controllers/carparkAvailability/carparkAvailability.routes");
// Initialising carparkInformation Routes
const carparkInformationRoutes = require("./controllers/carparkInformation/carparkInformation.routes");

// ========== Set-Up ==========
// Initiating app
const app = express();
const port = 8000;

// Using Static Public
app.use(express.static(path.join(__dirname, "public")));

// Using JSON
app.use(express.json());

// Return index.html at default endpoint
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, ".", "public", "index.html"));
});

// ========== Routes ==========
// Carpark Availability Route
app.use("/api/carparkAvailability", carparkAvailabilityRoutes);
// Carpark Information Route
app.use("/api/carparkInformation", carparkInformationRoutes);

// ========== Initialise Server ==========
// Server Listening at port 8000
app.listen(port, async () => {
  console.log(`Server successfully running on http://localhost:${port}`);
  console.log("Press CTRL+C to stop the server.");
});

// Close the connection pool on SIGINT signal
process.on("SIGINT", async () => {
  process.exit(0); // Exit with code 0 indicating successful shutdown
});

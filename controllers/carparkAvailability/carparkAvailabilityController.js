// ========== Models ==========
// Initialising model
const CarparkAvailability = require("../../models/carparkAvailability.js");

// ========== Controller ==========
// Controller Logic
class CarparkController {
  static async getCarparkAvailability(req, res) {
    console.log("Hi");
    try {
      const carparkAvailability = new CarparkAvailability();
      const data = await carparkAvailability.fetchCarparkData();

      res.status(200).json({
        success: true,
        data: data,
      });
    } catch (error) {
      console.error(`Error in CarparkController: ${error.message}`);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve carpark availability data",
      });
    }
  }
}

// ========== Export ==========
// Exporting Controller
module.exports = CarparkController;

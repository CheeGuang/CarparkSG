// ========== Models ==========
// Initialising model
const CarparkInformation = require("../../models/carparkInformation.js");

// ========== Controller ==========
// Controller Logic
class CarparkInformationController {
  static async getCarparkInformation(req, res) {
    try {
      const carparkInformation = new CarparkInformation();
      const data = await carparkInformation.fetchCarparkData();

      res.status(200).json({
        success: true,
        data: data,
      });
    } catch (error) {
      console.error(`Error in CarparkController: ${error.message}`);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve carpark information data",
      });
    }
  }
}

// ========== Export ==========
// Exporting Controller
module.exports = CarparkInformationController;

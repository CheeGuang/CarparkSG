// ========== Packages ==========
// Initialising express
require("dotenv").config();
const axios = require("axios");

// ========== Model ==========
// Model Logic
class CarparkAvailability {
  async fetchCarparkData() {
    try {
      const response = await axios.get(
        "https://api.data.gov.sg/v1/transport/carpark-availability"
      );
      const carparkData = response.data.items[0].carpark_data;

      // Format the data as needed
      const formattedData = carparkData.map((carpark) => {
        return {
          carpark_number: carpark.carpark_number,
          total_lots: carpark.carpark_info[0].total_lots,
          lot_type: carpark.carpark_info[0].lot_type,
          lots_available: carpark.carpark_info[0].lots_available,
          update_datetime: response.data.items[0].timestamp,
        };
      });

      return formattedData;
    } catch (error) {
      console.error(`Error fetching carpark data: ${error.message}`);
      throw new Error("Failed to fetch carpark data");
    }
  }
}

// ========== Export ==========
// Exporting Model
module.exports = CarparkAvailability;

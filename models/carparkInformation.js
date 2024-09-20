// ========== Packages ==========
// Initializing required packages
const http2 = require("http2");
const zlib = require("zlib"); // Import the zlib module for decompression
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const csv = require("csv-parser"); // Import csv-parser

// ========== Model ==========
// Model Logic
class CarparkInformation {
  async fetchCarparkData() {
    console.log("Fetching carpark data...");
    try {
      const downloadLink = await this.getDownloadLink();
      console.log("Download link:", downloadLink);

      // Download the CSV file
      const response = await axios.get(downloadLink, {
        responseType: "stream",
      });
      const filePath = path.join(
        __dirname,
        "../data/HDBCarparkInformation.csv"
      );

      // Create a write stream to save the file
      const writer = fs.createWriteStream(filePath);
      response.data.pipe(writer);

      // Return a promise that resolves when the file has been written
      await new Promise((resolve, reject) => {
        writer.on("finish", () => {
          console.log("CSV file downloaded successfully.");
          resolve(filePath);
        });
        writer.on("error", (error) => {
          console.error(`Error writing file: ${error.message}`);
          reject(error);
        });
      });

      // Read the CSV file and convert it to JSON
      const jsonData = await this.convertCsvToJson(filePath);
      return jsonData;
    } catch (error) {
      console.error(`Error fetching carpark data: ${error.message}`);
      throw error;
    }
  }

  async convertCsvToJson(filePath) {
    return new Promise((resolve, reject) => {
      const results = [];
      fs.createReadStream(filePath)
        .pipe(csv())
        .on("data", (data) => results.push(data))
        .on("end", () => {
          console.log("CSV file converted to JSON successfully.");
          resolve(results);
        })
        .on("error", (error) => {
          console.error(`Error reading CSV file: ${error.message}`);
          reject(error);
        });
    });
  }

  async getDownloadLink() {
    console.log("Carpark Information Model Called");

    const client = http2.connect("https://data.gov.sg");

    // Request headers
    const requestHeaders = {
      ":method": "POST",
      ":path":
        "/datasets?query=carpark&page=1&resultId=d_23f946fa557947f93a8043bbef41dd09",
      ":authority": "data.gov.sg",
      "Content-Length": "72", // Length of the JSON payload
      Cookie:
        "_dd_s=rum=1&id=02eec95c-d7a1-45b8-be18-780cecd96792&created=1726848341345&expire=1726849241345",
      "Sec-Ch-Ua": '"Not;A=Brand";v="24", "Chromium";v="128"',
      "Next-Router-State-Tree":
        "%5B%22%22%2C%7B%22children%22%3A%5B%22(view)%22%2C%7B%22children%22%3A%5B%22datasets%22%2C%7B%22results%22%3A%5B%22__PAGE__%3F%7B%5C%22query%5C%22%3A%5C%22carpark%5C%22%2C%5C%22page%5C%22%3A%5C%221%5C%22%2C%5C%22resultId%5C%22%3A%5C%22d_23f946fa557947f93a8043bbef41dd09%5C%22%7D%22%2C%7B%22children%22%3A%5B%22__PAGE__%3F%7B%5C%22query%5C%22%3A%5C%22carpark%5C%22%2C%5C%22page%5C%22%3A%5C%221%5C%22%2C%5C%22resultId%5C%22%3A%5C%22d_23f946fa557947f93a8043bbef41dd09%5C%22%7D%22%2C%7B%7D%2C%22%2Fdatasets%3Fquery%3Dcarpark%26page%3D1%26resultId%3Dd_23f946fa557947f93a8043bbef41dd09%23tag%2Fdefault%2FGET%2Ftransport%2Fcarpark-availability%22%2C%22refresh%22%5D%7D%2C%22%2Fdatasets%3Fquery%3Dcarpark%26page%3D1%26resultId%3Dd_23f946fa557947f93a8043bbef41dd09%23tag%2Fdefault%2FGET%2Ftransport%2Fcarpark-availability%22%2C%22refresh%22%5D%2C%22children%22%3A%5B%22__PAGE__%3F%7B%5C%22query%5C%22%3A%5C%22carpark%5C%22%2C%5C%22page%5C%22%3A%5C%221%5C%22%2C%5C%22resultId%5C%22%3A%5C%22d_23f946fa557947f93a8043bbef41dd09%5C%22%7D%22%2C%7B%7D%2C%22%2Fdatasets%3Fquery%3Dcarpark%26page%3D1%26resultId%3Dd_23f946fa557947f93a8043bbef41dd09%23tag%2Fdefault%2FGET%2Ftransport%2Fcarpark-availability%22%2C%22refresh%22%5D%7D%5D%7D%5D%7D%2Cnull%2Cnull%2Ctrue%5D",
      "Accept-Language": "en-GB,en-US;q=0.9,en;q=0.8",
      "Sec-Ch-Ua-Mobile": "?0",
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.6613.120 Safari/537.36",
      "Content-Type": "text/plain;charset=UTF-8",
      Accept: "text/x-component",
      "Accept-Encoding": "gzip, deflate, br, zstd",
      "Next-Action": "67b6ef9e44289f6c52ff706ebc43d8b6a12aaaf1",
      "Sec-Ch-Ua-Platform": '"Windows"',
      Origin: "https://data.gov.sg",
      "Sec-Fetch-Site": "same-origin",
      "Sec-Fetch-Mode": "cors",
      "Sec-Fetch-Dest": "empty",
      Referer:
        "https://data.gov.sg/datasets?query=carpark&page=1&resultId=d_23f946fa557947f93a8043bbef41dd09",
      Priority: "u=1, i",
    };

    // Payload for the POST request
    const postData = JSON.stringify([
      { datasetId: "d_23f946fa557947f93a8043bbef41dd09", readForView: false },
    ]);

    return new Promise((resolve, reject) => {
      const req = client.request(requestHeaders);

      // Write the payload to the request
      req.write(postData);

      let responseData = Buffer.alloc(0); // Initialize response buffer

      req.on("data", (chunk) => {
        responseData = Buffer.concat([responseData, chunk]); // Concatenate data chunks
      });

      req.on("end", () => {
        // Decompress the response if necessary
        zlib.gunzip(responseData, (err, result) => {
          if (err) {
            console.error(`Error decompressing data: ${err.message}`);
            return reject(err);
          }

          // Convert buffer to string
          const responseString = result.toString();

          // Extract the HTTPS link using a regular expression
          const httpsLinkMatch = responseString.match(/https:\/\/[^\s]+/);
          if (httpsLinkMatch) {
            const httpsLink = httpsLinkMatch[0].split("1:")[0];
            console.log("httpsLink:", httpsLink); // Log decompressed data
            resolve(httpsLink); // Resolve with the HTTPS link
          } else {
            reject(new Error("HTTPS link not found in response"));
          }
        });
        client.close();
      });

      req.on("error", (error) => {
        console.error(`Error fetching carpark data: ${error.message}`);
        reject(error);
        client.close();
      });

      req.end(); // Ends the request
    });
  }
}

// ========== Export ==========
// Exporting Model
module.exports = CarparkInformation;

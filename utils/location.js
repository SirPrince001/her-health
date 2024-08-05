const axios = require("axios");
require('dotenv').config()


const GEOCODE_API_KEY = process.env.MAP_API_KEY;
const GEOCODE_API_URL = "https://maps.googleapis.com/maps/api/geocode/json";

async function getCoordinatesFromCity(city) {
  try {
    const response = await axios.get(GEOCODE_API_URL, {
      params: {
        address: city,
        key: GEOCODE_API_KEY,
      },
    });

    if (response.data.results.length > 0) {
      const location = response.data.results[0].geometry.location;
      return {
        latitude: location.lat,
        longitude: location.lng,
      };
    } else {
      throw new Error("No results found for the specified city");
    }
  } catch (error) {
    throw new Error("Error fetching coordinates: " + error.message);
  }
}

module.exports = getCoordinatesFromCity;





const getCoordinates = async (city) => {
  const apiKey = process.env.API_KEY; // Replace with your actual API key
  const endpoint = `https://api.example.com/geocode?address=${encodeURIComponent(
    city
  )}&key=${apiKey}`;

  try {
    const response = await axios.get(endpoint);
    const data = response.data;

    if (!data || !data.results || data.results.length === 0) {
      throw new Error("No results found for the specified city");
    }

    // Extract coordinates from the response
    const coordinates = data.results[0].geometry.location;
    console.log(`Coordinates for ${city}:`, coordinates);

    return coordinates;
  } catch (error) {
    console.error("Error fetching coordinates:", error.message);
    // Handle or rethrow the error as needed
  }
};

module.exports = getCoordinates;


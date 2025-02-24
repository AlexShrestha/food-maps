const axios = require("axios");

exports.handler = async () => {
  try {
    const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
    const BASE_ID = process.env.BASE_ID;
    const TABLE_ID = process.env.TABLE_ID;
    const MAPBOX_API_KEY = process.env.MAPBOX_API_KEY; // Load Mapbox key

    if (!AIRTABLE_API_KEY || !BASE_ID || !TABLE_ID || !MAPBOX_API_KEY) {
      throw new Error(
        "Missing API keys or IDs in Netlify environment variables. " +
        "Please set AIRTABLE_API_KEY, BASE_ID, TABLE_ID, and MAPBOX_API_KEY in your Netlify environment variables."
      );
    }

    const url = `https://api.airtable.com/v0/${BASE_ID}/${TABLE_ID}?filterByFormula=(Map%3D2)`;
    const response = await axios.get(url, {
      headers: { Authorization: `Bearer ${AIRTABLE_API_KEY}` }
    });

    return {
      statusCode: 200,
      body: JSON.stringify({
        airtableData: response.data,
        mapboxKey: MAPBOX_API_KEY // Send Mapbox key to frontend
      })
    };
  } catch (error) {
    console.error("Error in Netlify function:", error.message); // Log error for debugging
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};
const axios = require("axios");

exports.handler = async () => {
  try {
    const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
    const BASE_ID = process.env.BASE_ID;
    const TABLE_ID = process.env.TABLE_ID;
    const MAPBOX_API_KEY = process.env.MAPBOX_API_KEY; // Load Mapbox key

    if (!AIRTABLE_API_KEY || !BASE_ID || !TABLE_ID || !MAPBOX_API_KEY) {
      throw new Error("Missing API keys in Netlify environment variables");
    }

    const url = `https://api.airtable.com/v0/${BASE_ID}/${TABLE_ID}`;
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
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};
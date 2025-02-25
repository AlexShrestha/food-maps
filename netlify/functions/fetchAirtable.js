const axios = require("axios");

exports.handler = async (event) => {
  try {
    const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
    const BASE_ID = process.env.BASE_ID;
    const TABLE_ID = process.env.TABLE_ID;
    const MAPBOX_API_KEY = process.env.MAPBOX_API_KEY;

    if (!AIRTABLE_API_KEY || !BASE_ID || !TABLE_ID || !MAPBOX_API_KEY) {
      return { statusCode: 500, body: JSON.stringify({ error: "Missing API keys" }) };
    }

    const mapID = event.queryStringParameters.mapID;
    if (!mapID) {
      return { statusCode: 400, body: JSON.stringify({ error: "Missing mapID parameter" }) };
    }

    const url = `https://api.airtable.com/v0/${BASE_ID}/${TABLE_ID}?filterByFormula={Map%20ID}='${mapID}'`;

    const response = await axios.get(url, {
      headers: { Authorization: `Bearer ${AIRTABLE_API_KEY}` }
    });

    if (!response.data.records.length) {
      return { statusCode: 404, body: JSON.stringify({ error: "Map ID not found in Airtable" }) };
    }

    const record = response.data.records[0];
    const videoLink = record.fields["Video Link"] || "";

    // ✅ Extract all locations
    const locationsRaw = record.fields["Locations"] ? record.fields["Locations"].split("\n") : [];
    
    // ✅ Extract lat/lng from long Google Maps URLs
    const locations = locationsRaw.map((link) => {
      const match = link.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
      return match ? {
        name: link.split('/place/')[1]?.split('/@')[0] || "Unknown",
        url: link,
        coords: [parseFloat(match[2]), parseFloat(match[1])]
      } : null;
    }).filter(Boolean);

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        airtableData: true,
        videoLink,
        locations,
        mapboxKey: MAPBOX_API_KEY
      })
    };
  } catch (error) {
    return {
      statusCode: error.response ? error.response.status : 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};
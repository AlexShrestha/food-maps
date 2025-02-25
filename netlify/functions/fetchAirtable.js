const axios = require("axios");

exports.handler = async (event) => {
  try {
    const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
    const BASE_ID = process.env.BASE_ID;
    const TABLE_ID = process.env.TABLE_ID;
    const MAPBOX_API_KEY = process.env.MAPBOX_API_KEY;

    if (!AIRTABLE_API_KEY || !BASE_ID || !TABLE_ID || !MAPBOX_API_KEY) {
      console.error("Missing environment variables");
      return { statusCode: 500, body: JSON.stringify({ error: "Missing API keys in Netlify environment variables" }) };
    }

    const mapID = event.queryStringParameters.mapID;
    if (!mapID) {
      return { statusCode: 400, body: JSON.stringify({ error: "Missing mapID parameter" }) };
    }

    const url = `https://api.airtable.com/v0/${BASE_ID}/${TABLE_ID}?filterByFormula={Map%20ID}='${mapID}'`;
    console.log("Fetching Airtable data from:", url);
    
    const response = await axios.get(url, {
      headers: { Authorization: `Bearer ${AIRTABLE_API_KEY}` }
    });

    if (!response.data.records.length) {
      return { statusCode: 404, body: JSON.stringify({ error: "Map ID not found in Airtable" }) };
    }

    const record = response.data.records[0];
    const videoLink = record.fields["Video Link"] || "";

    // ✅ Extract all locations from a single field (newline-separated format)
    const locationsRaw = record.fields["Locations"] ? record.fields["Locations"].split("\n") : [];
    const locations = locationsRaw.map(link => ({
      url: link.trim(),
      name: link.trim() // Placeholder, can extract names later
    }));

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
    console.error("Airtable Fetch Error:", error.response ? error.response.data : error);
    return {
      statusCode: error.response ? error.response.status : 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};
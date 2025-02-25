// netlify/functions/fetchAirtable.js
const axios = require("axios");

exports.handler = async (event) => {
  try {
    const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
    const BASE_ID = process.env.BASE_ID;
    const TABLE_ID = process.env.TABLE_ID;
    const MAPBOX_API_KEY = process.env.MAPBOX_API_KEY;

    const mapID = event.queryStringParameters.mapID;
    if (!mapID) {
      return { statusCode: 400, body: JSON.stringify({ error: "Missing mapID" }) };
    }

    const url = `https://api.airtable.com/v0/${BASE_ID}/${TABLE_ID}?filterByFormula={Map%20ID}='${mapID}'`;
    const response = await axios.get(url, {
      headers: { Authorization: `Bearer ${AIRTABLE_API_KEY}` }
    });

    if (response.data.records.length === 0) {
      return { statusCode: 404, body: JSON.stringify({ error: "Map not found" }) };
    }

    const record = response.data.records[0];
    const videoLink = record.fields["Video Link"];
    const locationsRaw = record.fields["Locations"] ? record.fields["Locations"].split("\n") : [];

    const locations = locationsRaw.map(link => {
      return { name: link, url: link }; // Simplified: Extract names later if needed
    });

    return {
      statusCode: 200,
      body: JSON.stringify({
        airtableData: true,
        videoLink,
        locations,
        mapboxKey: MAPBOX_API_KEY
      })
    };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};
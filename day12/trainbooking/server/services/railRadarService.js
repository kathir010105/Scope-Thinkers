const axios = require("axios");

const RAILRADAR_BASE_URL = "https://api.railradar.in";

const railRadarApi = axios.create({
  baseURL: RAILRADAR_BASE_URL,
  headers: {
    Authorization: `Bearer ${process.env.RAILRADAR_API_KEY}`,
  },
});

async function searchStations(query) {
  const response = await railRadarApi.get("/v1/lookup/search/stations", {
    params: {
      q: query,
      limit: 10,
    },
  });

  return response.data;
}

async function getTrainsBetweenStations(from, to, date) {
  const response = await railRadarApi.get(`/v1/trains/between/${from}/${to}`, {
    params: {
      date,
    },
  });

  return response.data;
}


async function getSeatAvailability(
  trainNumber,
  source,
  destination,
  journeyDate,
  classCode,
  quotaCode,
) {
  const response = await railRadarApi.get(`/v1/trains/${trainNumber}/seats`, {
    params: {
      source,
      destination,
      journeyDate,
      classCode,
      quotaCode,
    },
  });

  return response.data;
}

async function getFare(
  trainNumber,
  source,
  destination,
  journeyDate,
  classCode,
  quotaCode,
) {
  const response = await railRadarApi.get(`/v1/trains/${trainNumber}/fare`, {
    params: {
      source,
      destination,
      journeyDate,
      classCode,
      quotaCode,
    },
  });

  return response.data;
}

async function getTrainCoaches(trainNumber) {
  const response = await railRadarApi.get(`/v1/trains/${trainNumber}/coaches`);

  console.log(
    "RAW COACH API RESPONSE:",
    JSON.stringify(response.data, null, 2),
  );

  return response.data;
}


module.exports = {
  searchStations,
  getTrainsBetweenStations,
  getSeatAvailability,
  getFare,
  getTrainCoaches,
};
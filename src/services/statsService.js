import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export const getPublicStats = async () => {
  const { data } = await axios.get(`${API_URL}/stats/public`);
  return data;
};

export const getTopCountries = async () => {
  const { data } = await axios.get(`${API_URL}/stats/top-countries`);
  return data?.topCountries || [];
};

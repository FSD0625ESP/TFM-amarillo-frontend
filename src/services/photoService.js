import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export const getHighlightedPhotos = async () => {
  const { data } = await axios.get(`${API_URL}/photos/highlighted`);
  return data;
};
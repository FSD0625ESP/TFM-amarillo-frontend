import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export const getHighlightedPhotos = async () => {
  const { data } = await axios.get(`${API_URL}/photos/highlighted`);
  return data;
};

export const getPhotos = async (filters = {}) => {
  const params = {};

  if (filters.country) params.country = filters.country;
  if (filters.year) params.year = filters.year;
  if (filters.sortBy) params.sortBy = filters.sortBy;

  const { data } = await axios.get(`${API_URL}/photos`, { params });
  return data;
};

export const getPhotoCountries = async () => {
  const { data } = await axios.get(`${API_URL}/stats/countries`);
  return data?.countries || [];
};

export const getPhotoYears = async () => {
  const { data } = await axios.get(`${API_URL}/stats/years`);
  return data?.years || [];
};

export const likePhoto = async (photoId) => {
  const token = localStorage.getItem("userToken");

  if (!token) {
    throw new Error("No autenticado");
  }

  const res = await axios.patch(
    `${API_URL}/photos/${photoId}/like`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return res.data;
};
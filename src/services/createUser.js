import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export const registerUser = (formData) =>
  axios.post(`${API_URL}/emails/send`, formData, {
    headers: {"Content-Type": "multipart/form-data",}
  });

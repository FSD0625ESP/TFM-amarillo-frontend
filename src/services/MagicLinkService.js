import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

export const sendMagicLink = (email) => 
    axios.post(`${API_URL}/emails/magic-link`, { email });

export const verifyToken = (token) => 
    axios.get(`${API_URL}/emails/verify-token?token=${encodeURIComponent(token)}`);

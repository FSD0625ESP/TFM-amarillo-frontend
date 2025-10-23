import axios from "axios";

export const sendMagicLink = (email) => 
    axios.post("http://localhost:3000/emails/magic-link", { email });

export const verifyToken = (token) => 
    axios.get(`http://localhost:3000/emails/verify-token?token=${token}`);

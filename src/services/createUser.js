import axios from "axios";

export const registerUser = (formData) => 
  axios.post("http://localhost:3000/emails/send", formData, {
    headers: {"Content-Type": "multipart/form-data",}
    });
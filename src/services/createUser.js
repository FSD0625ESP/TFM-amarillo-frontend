import axios from "axios";

const registerUser = async (formPayload) => {
  try {
    const response = await axios.post("http://localhost:3000/emails/send", formPayload);
    return {data: response.data};
  } catch (error) {
    throw error;
  }
};

export { registerUser };

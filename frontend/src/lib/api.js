import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  withCredentials: true,
  // Without this, a hung request (e.g. the backend can't reach Cloudinary)
  // would spin forever with no error ever surfacing to the user — this
  // guarantees it fails visibly instead.
  timeout: 30000,
});

export default api;
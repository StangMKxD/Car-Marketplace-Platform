import axios from "axios";

// api
export const api = axios.create({
  baseURL: "http://localhost:5000/api",
});
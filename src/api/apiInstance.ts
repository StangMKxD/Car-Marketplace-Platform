import axios from "axios";

// api
export const api = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api`,
});

export const getAuthHeader = () => {
  const token = localStorage.getItem("token")
  if (!token) throw new Error("No token found")
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    withCredentials: true,
  }
}
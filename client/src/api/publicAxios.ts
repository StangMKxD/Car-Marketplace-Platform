import axios from "axios";

const publicAxios = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api`,
  withCredentials: false, 
});

export default publicAxios;

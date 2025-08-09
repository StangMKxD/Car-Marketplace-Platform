// src/api/axiosInstance.ts
import { logout } from "@/utils/logout";
import axios from "axios";
import { toast } from "react-toastify";

// 1. สร้าง instance
const axiosInstance = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api`,
  withCredentials: true,
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      if (error.response.status === 401) {
        toast.error("เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่");
        logout();
      } else if (
        error.response.status === 403 &&
        error.response.data?.message === "กรุณายืนยันอีเมลก่อนทำการจอง"
      ) {
        toast.error("กรุณายืนยันอีเมลก่อนทำการจอง");
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;

import { Cartype } from "@/types";
import { getAuthHeader } from "./apiInstance";
import axiosInstance from "./axiosInstance";

// ดึงข้อมูล User ทั้งหมด
export const userData = async () => {
    const res = await axiosInstance.get("/userlist", getAuthHeader())
     return res.data
};

// ลบ user id
export const removeUser = async (id: number) => {
  const res = await axiosInstance.delete(`/userlist/${id}`, getAuthHeader())
  return res.data
};

// ลบรถจาก id
export const removeData = async (id: number) => {
  const res = await axiosInstance.delete(`cars/${id}`, getAuthHeader())
  return res.data
};

// อัปเดตรถ
export const updateData = async (id: number, payload: Cartype) => {
  const res = await axiosInstance.put(`cars/${id}`, payload, getAuthHeader())
  return res.data
}

// เพิ่มรถ
export const addCar = async (formData: FormData, token: string) => {
  const res = await axiosInstance.post("/cars", formData, getAuthHeader())
  return res.data
}

// ดูรายการจองรถ
export const getBookingList = async () => {
  try {
    const res = await axiosInstance.get("/userlist/bookinglist", getAuthHeader());
    return res.data;
  } catch (err: any) {
    console.error("โหลดข้อมูลการจองของผู้ใช้ไม่สำเร็จ:", err)
    return []
  }
}

// อนุมัติการจอง
export const updateBookingList = async (id: number, status: "APPROVED" | "REJECTED" ) => {
    const res = await axiosInstance.put(`/userlist/bookinglist/${id}`, { status }, getAuthHeader())
    return res.data
}

export const adminDashboard = async () => {
  const res = await axiosInstance.get('/admin/dashboard', getAuthHeader())
  return res.data
}

// alet stock
export const getAlert = async () => {
  const res = await axiosInstance.get('/alertstock', getAuthHeader())
  return res.data
}
import { Cartype } from "@/types";
import { api, getAuthHeader } from "./apiInstance";

// ดึงข้อมูล User ทั้งหมด
export const userData = async () => {
    const res = await api.get("/userlist", getAuthHeader())
    const data = res.data
    return data
};

// ลบ user id
export const removeUser = async (id: number) => {
  const res = await api.delete(`/userlist/${id}`, getAuthHeader())
  return res.data
};

// ลบรถจาก id
export const removeData = async (id: number) => {
  const res = await api.delete(`cars/${id}`, getAuthHeader())
  return res.data
};

// เพิ่มรถใหม่
export const createData = async (newCar: Cartype) => {
  const res = await api.post("/cars", newCar, getAuthHeader())

  return res.data
}

// อัปเดตรถ
export const updateData = async (id: number, payload: Cartype) => {
  const res = await api.put(`cars/${id}`, payload, getAuthHeader())
  return res.data
}

// เพิ่มรถ
export const addCar = async (formData: FormData, token: string) => {
  const res = await api.post("/cars", formData, getAuthHeader())
  return res.data
}

// ดูรายการจองรถ
export const getBookingList = async () => {
  try {
    const res = await api.get("/userlist/bookinglist", getAuthHeader());
    return res.data;
  } catch (err: any) {
    console.error("โหลดข้อมูลการจองของผู้ใช้ไม่สำเร็จ:", err)
    return []
  }
}

// อนุมัติการจอง
export const updateBookingList = async (id: number, status: "APPROVED" | "REJECTED" ) => {
    const res = await api.put(`/userlist/bookinglist/${id}`, { status }, getAuthHeader())
    return res.data
}

import type { Usertype } from "../types"
import { api, getAuthHeader } from "./apiInstance"

// ดึงข้อมูลรถทั้งหมด
export const getData = async () => {
  const res = await api.get("/cars")
  return res.data;
}

// ดึงข้อมูลรถเฉพาะไอดี
export const getCarById = async (id: number) => {
  const res = await api.get(`/cars/${id}`);
  return res.data;
};

// ดูโปรไฟล
export const profileUser = async () => {
  try {
    const res = await api.get("/user/profile", getAuthHeader())
    const data = res.data
    return data
  } catch (err) {
    console.error("โหลดโปรไฟล์ไม่สำเร็จ:", err)
    return []
  }
}

// User updateprofile
export const updateProfile = async (id: number, payload: Usertype) => {
  const res = await api.put("/user/updateprofile", payload, getAuthHeader())
  return res.data
}

// add favorite
export const addFavorite = async (carId: number) => {
  try {
    const res = await api.post(
      "/user/addfavorite-cars",
      { carId },
      getAuthHeader()
    );
    return res.data
  } catch (err: any) {
    const msg = err.response?.data?.message;
    throw new Error(msg)
  }
}

// remove favoritecar
export const removeFavorite = async (carId: number) => {
  try {
    const res = await api.delete(`/user/myfavorite-cars/${carId}`, getAuthHeader())
    return res.data
  } catch (err: any) {
    const msg = err.res?.data?.message
    throw new Error(msg)
  }
}

// get favoritecar
export const getFavorites = async () => {
  try {
    const res = await api.get("/user/myfavorite-cars", getAuthHeader())
    return res.data
  } catch (err: any) {
    const msg = err.res?.data?.message
    throw new Error(msg)
  }
}

// จองทดลองขับ
export const bookTestDrive = async ( carId: number, date: string, token: string) => {
  try {
    const res = await api.post("/user/bookings", { carId, date }, getAuthHeader());
    return res.data
  } catch (err: any) {
    const msg = err.res?.data?.message
    throw new Error(msg)
  }
}

// ดูจองทดลองขับ
export const getUserBooking = async () => {
    const res = await api.get("/user/mybookings", getAuthHeader())
    return res.data
}

//ลบรายการจองทดลองขับ
export const removeBookingList = async (id: number) => {
  const res = await api.delete(`/user/mybookings/${id}`, getAuthHeader())
  return res.data
}

// ดูการเปรียบเทียบรถ
export const getCompareUser = async () => {
  const res = await api.get("/user/comparecar", getAuthHeader())
  return res.data
}

// toggle เปรียบเทีนยรถ
export const toggleCompare = async (carId: number) => {
  const res = await api.post("/user/comparecar", { carId }, getAuthHeader())
  return res.data
}
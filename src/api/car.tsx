import axios from "axios";
import type { Cartype, Usertype } from "../types";
import { api } from "./apiInstance";

const ENDPOINTADMIN = "http://localhost:5000/api/cars";
const getAuthHeader = () => {
  const token = localStorage.getItem("token");
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

// login
export const loginForm = async (form: { email: string; password: string }) => {
  try {
    const res = await api.post("/login", form);

    return res.data;
  } catch (error: any) {
    console.error("ล็อคอินไม่สำเร็จ", error);
    throw error;
  }
};
// register
export const registerUser = async (form: {
  name: string;
  surname: string;
  email: string;
  password: string;
  phone: string;
}) => {
  try {
    const res = await api.post("/register", form);
    return res.data;
  } catch (error: any) {
    console.error("สมัครสมาชิกไม่สำเร็จ:", error);
    throw error;
  }
};
// ดึงข้อมูล User ทั้งหมด
export const userData = async () => {
  try {
    const res = await api.get("/user", getAuthHeader());
    const data = res.data;
    return data;
  } catch (error: any) {
    console.error("โหลดข้อมูลผู้ใช้ไม่สำเร็จ:", error);
    return [];
  }
};

// ดูโปรไฟล
export const profileUser = async () => {
  try {
    const res = await api.get("/user/profile", getAuthHeader());
    const data = res.data;
    return data;
  } catch (error) {
    console.error("โหลดโปรไฟล์ไม่สำเร็จ:", error);
    return [];
  }
};
// ดึงข้อมูลรถทั้งหมด
export const getData = async () => {
  const res = await api.get("/cars");
  return res.data;
};

// ลบ user id
export const removeUser = async (id: number) => {
  try {
    const res = await api.delete(`/user/${id}`, getAuthHeader());
    return res.data;
  } catch (error: any) {
    console.error("Error deleting User:", error);
    throw error;
  }
};

// ลบรถจาก id
export const removeData = async (id: number) => {
  try {
    const res = await axios.delete(`${ENDPOINTADMIN}/${id}`, getAuthHeader());
    return res.data;
  } catch (error: any) {
    console.error("Error deleting car (full):", error);
    throw error;
  }
};

// เพิ่มรถใหม่
export const createData = async (newCar: Cartype) => {
  const res = await axios.post(ENDPOINTADMIN, newCar, getAuthHeader());

  return res.data;
};

// อัปเดตรถ
export const updateData = async (id: number, payload: Cartype) => {
  const res = await axios.put(
    `${ENDPOINTADMIN}/${id}`,
    payload,
    getAuthHeader()
  );

  return res.data;
};

// User updateprofile
export const updateProfile = async (id: number, payload: Usertype) => {
  const res = await api.put("/user/updateprofile", payload, getAuthHeader());
  return res.data;
};

// add favorite
export const addFavorite = async (carId: number) => {
  try {
    const res = await api.post(
      "/user/addfavorite-cars",
      { carId },
      getAuthHeader()
    );
    return res.data;
  } catch (error: any) {
    const msg = error.response?.data?.message;
    throw new Error(msg);
  }
};

// remove favoritecar
export const removeFavorite = async (carId: number) => {
  try {
    const res = await api.delete(`/user/myfavorite-cars/${carId}`, getAuthHeader());
    return res.data;
  } catch (error) {
    console.error("Error Remove Favorite:", error);
    throw error;
  }
};

// get favoritecar
export const getFavorites = async () => {
  try {
    const res = await api.get("/user/myfavorite-cars", getAuthHeader());
    return res.data;
  } catch (error: any) {
    const msg = error.response?.data?.message;
    throw new Error(msg);
  }
};

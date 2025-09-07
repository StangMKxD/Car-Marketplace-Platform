import type { Usertype } from "../types";
import { getAuthHeader } from "./apiInstance";
import axiosInstance from "./axiosInstance";

// ดึงข้อมูลรถทั้งหมด
export const getData = async () => {
  const res = await axiosInstance.get("/cars");
  return res.data;
};

// ดึงข้อมูลรถเฉพาะไอดี
export const getCarById = async (id: number) => {
  const res = await axiosInstance.get(`/cars/${id}`);
  return res.data;
};

// ดูโปรไฟล
export const profileUser = async () => {
  try {
    const res = await axiosInstance.get("/user/profile", getAuthHeader());
    const data = res.data;
    return data;
  } catch (err) {
    console.error("โหลดโปรไฟล์ไม่สำเร็จ:", err);
    return [];
  }
};

// User updateprofile
export const updateProfile = async (id: number, payload: Usertype) => {
  const res = await axiosInstance.put(
    "/user/updateprofile",
    payload,
    getAuthHeader()
  );
  return res.data;
};

// add favorite
export const addFavorite = async (carId: number) => {
  try {
    const res = await axiosInstance.post(
      "/user/addfavorite-cars",
      { carId },
      getAuthHeader()
    );
    return res.data;
  } catch (err: any) {
    const msg = err.response?.data?.message;
    throw new Error(msg);
  }
};

// remove favoritecar
export const removeFavorite = async (carId: number) => {
  try {
    const res = await axiosInstance.delete(
      `/user/myfavorite-cars/${carId}`,
      getAuthHeader()
    );
    return res.data;
  } catch (err: any) {
    const msg = err.res?.data?.message;
    throw new Error(msg);
  }
};

// get favoritecar
export const getFavorites = async () => {
  try {
    const res = await axiosInstance.get(
      "/user/myfavorite-cars",
      getAuthHeader()
    );
    return res.data;
  } catch (err: any) {
    const msg = err.res?.data?.message;
    throw new Error(msg);
  }
};

// จองทดลองขับ
export const bookTestDrive = async (
  carId: number,
  date: string,
  token: string
) => {
  try {
    const res = await axiosInstance.post(
      "/user/bookings",
      { carId, date },
      getAuthHeader()
    );
    return res.data;
  } catch (err: any) {
    const msg = err.response?.data?.message || "เกิดข้อผิดพลาด";
    throw new Error(msg);
  }
};

// ดูจองทดลองขับ
export const getUserBooking = async () => {
  const res = await axiosInstance.get("/user/mybookings", getAuthHeader());
  return res.data;
};

// ดูการเปรียบเทียบรถ
export const getCompareUser = async () => {
  const res = await axiosInstance.get("/user/comparecar", getAuthHeader());
  return res.data;
};

// toggle เปรียบเทีนยรถ
export const toggleCompare = async (carId: number) => {
  const res = await axiosInstance.post(
    "/user/comparecar",
    { carId },
    getAuthHeader()
  );
  return res.data;
};

// bookingpopularcars
export const getPopularCarsBookings = async () => {
  const res = await axiosInstance.get("/bkcars");
  return res.data;
};

// favoritepopularcars
export const getPopularCarsFavorites = async () => {
  const res = await axiosInstance.get("/fvcars");
  return res.data;
};

//new car
export const getNewCar = async () => {
  const res = await axiosInstance.get("/newcars")
  return res.data
}

// ยืนยันอีเมล
export const verifyEmail = async (token: string) => {
  const res = await axiosInstance.get(`/verifyemail?token=${token}`);
  return res.data;
};

// ส่งเมล
export const sendVerifyEmail = async () => {
  const res = await axiosInstance.post(
    "/send-verifyemail",
    {},
    getAuthHeader()
  );
  return res.data;
};

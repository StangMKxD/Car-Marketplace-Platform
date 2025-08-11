import axiosInstance from "./axiosInstance";

// login
export const loginForm = async (form: { email: string; password: string }) => {
  const res = await axiosInstance.post("/login", form);
  return res.data;
};
// register
export const registerUser = async (form: {
  name: string;
  surname: string;
  email: string;
  password: string;
  phone: string;
}) => {
  const res = await axiosInstance.post("/register", form);
  return res.data;
};

// ส่งเมล reset password
export const forgotPassword = async (email: string) => {
  const res = await axiosInstance.post("/forgot-password", { email });
  return res.data;
};
// ตรวจ โทเค่น ว่าใช้ได้ไหม
export const verifyReset = async (token: string) => {
  const res = await axiosInstance.get(`/reset-password?token=${token}`);
  return res.data;
};

//เปลี่ยนรหัสผ่าาน
export const resetPassword =  async (token: string, newPassword: string) => {
  const res = await axiosInstance.post(
    "/reset-password/update",
    {
      token,
      newPassword,
    }
  );
  return res.data
};

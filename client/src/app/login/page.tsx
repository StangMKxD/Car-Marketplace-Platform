"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "react-toastify";
import { useAuth } from "@/contexts/AuthContext";
import { forgotPassword, loginForm } from "@/api/auth";

const LoginPage = () => {
  const { setIsLoggedIn, setRole } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [sendingReset, setSendingReset] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const res = await loginForm(form);

      const token = res.token;
      const role = res.user.role;
      if (token && role) {
        localStorage.setItem("token", token);
        localStorage.setItem("role", role);
        setIsLoggedIn(true);
        setRole(role);
        toast.success("เข้าสู่ระบบสำเร็จ");

        router.push(role === "ADMIN" ? "/admin" : "/");
      } else {
        toast.error("Email หรือ Password ผิด");
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "เข้าสู่ระบบไม่สำเร็จ");
    }
  };

  const handleSendResetEmail = async () => {
    if (!forgotEmail) {
      toast.error("กรุณากรอกอีเมลก่อน");
      return;
    }
    setSendingReset(true);

    try {
      const data = await forgotPassword(forgotEmail);

      toast.success(data.message || "ส่งอีเมลเรียบร้อยแล้ว");
      setShowForgotModal(false);
      setForgotEmail("");
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || "เกิดข้อผิดพลาดในการส่งอีเมล"
      );
    } finally {
      setSendingReset(false);
    }
  };

  const handleRegister = () => {
    router.push("/register");
  };

  return (
    <>
      <div className="max-w-md mx-auto p-6 text-center bg-white border-2 border-[#dbdbdb] rounded-md shadow-2xl mt-20">
        <h2 className="text-xl font-bold mb-4 text-center">เข้าสู่ระบบ</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            name="email"
            placeholder="อีเมล"
            value={form.email}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="รหัสผ่าน"
            value={form.password}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
          <div className="flex items-center space-x-2 mt-1 justify-between">
            <div className="items-center">
              <input
                type="checkbox"
                onClick={() => setShowPassword(!showPassword)}
                className="cursor-pointer mr-1"
              />
              <label
                htmlFor="show-password"
                className="cursor-pointer select-none"
              >
                แสดงรหัสผ่าน
              </label>
            </div>
            <div className="items-center">
              <p
                className="text-blue-600 hover:underline cursor-pointer"
                onClick={() => setShowForgotModal(true)}
              >
                ลืมรหัสผ่าน
              </p>
            </div>
          </div>
          <div className="flex justify-center space-x-2 items-center">
            <button
              type="submit"
              className="w-[100px] bg-blue-600 text-white p-2 rounded hover:bg-blue-700 cursor-pointer"
            >
              เข้าสู่ระบบ
            </button>
            <button
              type="button"
              className="w-[100px] bg-blue-600 text-white p-2 rounded hover:bg-blue-700 cursor-pointer"
              onClick={handleRegister}
            >
              สมัครสมาชิก
            </button>
          </div>
        </form>
      </div>

      {showForgotModal && (
        <div
          className="fixed backdrop-blur-md inset-0 flex justify-center items-center z-50"
          onClick={() => setShowForgotModal(false)}
        >
          <div
            className="bg-white p-6 rounded shadow-lg w-80"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold mb-4 text-center">
              ลืมรหัสผ่าน
            </h3>
            <input
              type="email"
              placeholder="กรอกอีเมลของคุณ"
              value={forgotEmail}
              onChange={(e) => setForgotEmail(e.target.value)}
              className="w-full p-2 border rounded mb-4"
            />
            <div className="flex justify-between">
              <button
                onClick={() => setShowForgotModal(false)}
                className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400 cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleSendResetEmail}
                disabled={sendingReset}
                className="bg-blue-600 text-white px-4 py-2 rounded cursor-pointer hover:bg-blue-700 disabled:opacity-60"
              >
                ส่งลิงก์รีเซ็ตรหัสผ่าน
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default LoginPage;

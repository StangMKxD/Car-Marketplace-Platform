"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "react-toastify";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { loginForm } from "@/api/auth";

const LoginPage = () => {
  const { setIsLoggedIn, setRole } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

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

  return (
    <>
      <div className="max-w-md mx-auto mt-10 p-6 text-center bg-white border-2 border-[#dbdbdb] rounded-md shadow-2xl">
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
            type="password"
            name="password"
            placeholder="รหัสผ่าน"
            value={form.password}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
          <button
            type="submit"
            className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 cursor-pointer"
          >
            เข้าสู่ระบบ
          </button>

          <p>
            หากยังไม่ได้เป็นสมาชิกคลิ๊ก{" "}
            <Link href="/register">
              <span className="underline cursor-pointer hover:text-blue-700">
                สมัครสมาชิก
              </span>
            </Link>{" "}
            ได้เลย{" "}
          </p>
        </form>
      </div>
    </>
  );
};

export default LoginPage;

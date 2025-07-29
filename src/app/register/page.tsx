"use client";

import { useState } from "react";
import { toast } from "react-toastify";
import Link from "next/link";
import { useRouter } from "next/navigation";
import "react-toastify/dist/ReactToastify.css";
import { registerUser } from "@/api/car";

const fields = [
  { name: "name", placeholder: "ชื่อ", type: "text" },
  { name: "surname", placeholder: "นามสกุล", type: "text" },
  { name: "email", placeholder: "อีเมล", type: "text" },
  { name: "password", placeholder: "รหัสผ่าน", type: "password" },
  { name: "confirmpassword", placeholder: "ยืนยันรหัสผ่าน", type: "password" },
  { name: "phone", placeholder: "เบอร์โทร", type: "tel" },
];

const Page = () => {
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    surname: "",
    email: "",
    password: "",
    confirmpassword: "",
    phone: "",
  });

  const [passwordMatch, setPasswordMatch] = useState(true);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const updatedForm = { ...form, [e.target.name]: e.target.value };
    setForm(updatedForm);

    if (e.target.name === "password" || e.target.name === "confirmpassword") {
      setPasswordMatch(updatedForm.password === updatedForm.confirmpassword);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!passwordMatch) {
      toast.error("รหัสผ่านไม่ตรงกัน");
      return;
    }

    if (
      !form.name ||
      !form.email ||
      !form.password ||
      !form.surname ||
      !form.phone
    ) {
      toast.error("กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }

    try {
      const res = await registerUser(form); // ส่งไปยัง API
      toast.success(res.message);

      setTimeout(() => {
        router.push("/login");
      }, 1500);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "เกิดข้อผิดพลาด");
    }
  };

  return (
    <>
      <div className="w-full h-lvh">
        <div className="border-2 border-[#dbdbdb] rounded-md shadow-2xl text-center h-[600px] w-[600px] mx-auto mt-20">
          <h1 className="text-2xl text-center my-4">สมัครสมาชิก</h1>
          <form
            className="max-w-md mx-auto flex flex-col gap-4"
            onSubmit={handleSubmit}
          >
            {fields.map(({ name, placeholder, type }) => (
              <div key={name} className="flex flex-col gap-1">
                <input
                  name={name}
                  type={type}
                  placeholder={placeholder}
                  value={form[name as keyof typeof form]}
                  onChange={handleChange}
                  className="border px-4 py-2 rounded"
                />
                {name === "confirmpassword" && !passwordMatch && (
                  <p className="text-red-500 text-sm">รหัสผ่านไม่ตรงกัน</p>
                )}
              </div>
            ))}

            <button
              type="submit"
              className="mx-auto w-[200px] bg-blue-500 text-white px-4 py-2 rounded cursor-pointer"
            >
              สมัครสมาชิก
            </button>

            <p>
              หากสมัครแล้วคลิ๊ก{" "}
              <Link href="/login">
                <span className="underline cursor-pointer hover:text-blue-700">
                  เข้าสู่ระบบ
                </span>
              </Link>{" "}
              ได้เลย
            </p>
          </form>
        </div>
      </div>
    </>
  );
};

export default Page;

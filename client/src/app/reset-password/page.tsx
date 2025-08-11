"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { verifyReset, resetPassword } from "@/api/auth";

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") || "";

  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [tokenValid, setTokenValid] = useState(false);

  // เช็ค token ตอนโหลดหน้า
  useEffect(() => {
    if (!token) {
      toast.error("ไม่มี token รีเซ็ตรหัสผ่าน");
      router.push("/login");
      return;
    }

    verifyReset(token)
      .then(() => setTokenValid(true))
      .catch((err) => {
        toast.error(err?.response?.data?.message || "ลิงก์ไม่ถูกต้อง");
        router.push("/login");
      });
  }, [token, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 8) {
      toast.error("รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("รหัสผ่านไม่ตรงกัน");
      return;
    }

    setLoading(true);
    try {
      const res = await resetPassword(token, password);
      toast.success(res.message || "รีเซ็ตรหัสผ่านสำเร็จ");
      router.push("/login");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "รีเซ็ตรหัสผ่านล้มเหลว");
    } finally {
      setLoading(false);
    }
  };

 if (!tokenValid) {
  return <div className="text-center mt-10">กำลังตรวจสอบลิงก์...</div>;
}


  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4 text-center">ตั้งรหัสผ่านใหม่</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="password"
          placeholder="รหัสผ่านใหม่"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 border rounded"
          required
        />
        <input
          type="password"
          placeholder="ยืนยันรหัสผ่านใหม่"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full p-2 border rounded"
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-60 cursor-pointer"
        >
          {loading ? "กำลังรีเซ็ต..." : "รีเซ็ตรหัสผ่าน"}
        </button>
      </form>
    </div>
  );
}

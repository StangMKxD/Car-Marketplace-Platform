"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { verifyEmail } from "@/api/user"; // ฟังก์ชันที่คุณเขียนไว้เรียก backend

const VerifyEmailPage = () => {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState("กำลังยืนยัน...");

  useEffect(() => {
    if (!token) {
      setStatus("ไม่พบโทเค็น");
      return;
    }

    const run = async () => {
      try {
        const res = await verifyEmail(token);
        setStatus(res.message || "ยืนยันอีเมลสำเร็จ!");
      } catch (err: any) {
        setStatus(err.response?.data?.message || "เกิดข้อผิดพลาด");
      }
    };

    run();
  }, [token]);

  return (
    <div style={{ padding: 40 }}>
      <h1>{status}</h1>
    </div>
  );
}

export default VerifyEmailPage;

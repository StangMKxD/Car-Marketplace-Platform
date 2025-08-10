"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { getCompareUser, toggleCompare } from "@/api/user";
import { Cartype } from "@/types";
import { toast } from "react-toastify";

type CompareContextType = {
  carA: Cartype | null;
  carB: Cartype | null;
  count: number;
  toggle: (car: Cartype) => void;
};

const CompareContext = createContext<CompareContextType | null>(null);

export const CompareProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [carA, setCarA] = useState<Cartype | null>(null);
  const [carB, setCarB] = useState<Cartype | null>(null);

  const fetchCompare = async () => {
    try {
      const data = await getCompareUser();
      setCarA(data.carA);
      setCarB(data.carB);
    } catch {
      setCarA(null);
      setCarB(null);
    }
  };

  const toggle = async (car: Cartype) => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("กรุณาเข้าสู่ระบบก่อน");
      return;
    }

    try {
      const data = await toggleCompare(car.id);
      setCarA(data.carA);
      setCarB(data.carB);
    } catch (error: any) {
      if (error.response) {
        if (
          error.response.status === 400 &&
          error.response.data?.message?.includes("สูงสุด 2 คัน")
        ) {
          toast.warn("เลือกรถได้แค่ 2 คันเท่านั้น");
        } else {
          toast.error("เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
        }
      } else {
        toast.error("ไม่สามารถเชื่อมต่อกับเซิฟเวอร์ได้");
      }
    }
  };

  useEffect(() => {
    fetchCompare();
  }, []);

  return (
    <CompareContext.Provider
      value={{ carA, carB, count: Number(!!carA) + Number(!!carB), toggle }}
    >
      {children}
    </CompareContext.Provider>
  );
};

export const useCompare = () => {
  const context = useContext(CompareContext);
  if (!context) throw new Error("useCompare ต้องอยู่ใน CompareProvider");
  return context;
};

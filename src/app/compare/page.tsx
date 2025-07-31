"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Cartype } from "@/types";
import { toast } from "react-toastify";
import axios from "axios";

const ComparePage = () => {
    const hasShownToast = useRef(false);
  const searchParams = useSearchParams();
  const carAId = searchParams.get("carA");
  const carBId = searchParams.get("carB");

  const [carA, setCarA] = useState<Cartype | null>(null);
  const [carB, setCarB] = useState<Cartype | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCars = async () => {
      if (!carAId && !carBId) {
        if (!hasShownToast.current) {
          toast.error("กรุณาเลือกรถเพื่อเปรียบเทียบ");
          hasShownToast.current = true; 
        }
        return;
      }

      setLoading(true);

      try {
        if (carAId) {
          const resA = await axios.get(
            `http://localhost:5000/api/cars/${carAId}`
          );
          setCarA(resA.data);
        } else {
          setCarA(null);
        }

        if (carBId) {
          const resB = await axios.get(
            `http://localhost:5000/api/cars/${carBId}`
          );
          setCarB(resB.data);
        } else {
          setCarB(null);
        }
      } catch (error) {
        toast.error("เกิดข้อผิดพลาดในการโหลดข้อมูลรถ");
      } finally {
        setLoading(false);
      }
    };

    fetchCars();
  }, [carAId, carBId]);

  // 🟢 ลบฝั่ง A
  const handleRemoveA = () => {
    setCarA(null);
  };

  // 🔵 ลบฝั่ง B
  const handleRemoveB = () => {
    setCarB(null);
  };

  if (loading)
    return <div className="text-center py-10">กำลังโหลดข้อมูล...</div>;

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6 text-center">เปรียบเทียบรถยนต์</h1>

      <div className="grid grid-cols-3 gap-4 border-t border-b py-4 font-semibold text-center bg-gray-100">
        <div>คุณสมบัติ</div>
        <div>
          {carA ? (
            <>
              {carA.brand} {carA.model}
              <button
                onClick={handleRemoveA}
                className="ml-2 text-red-500 underline text-sm"
              >
                ลบออก
              </button>
            </>
          ) : (
            <span className="text-gray-400">รถคันที่ 1</span>
          )}
        </div>
        <div>
          {carB ? (
            <>
              {carB.brand} {carB.model}
              <button
                onClick={handleRemoveB}
                className="ml-2 text-red-500 underline text-sm"
              >
                ลบออก
              </button>
            </>
          ) : (
            <span className="text-gray-400">รถคันที่ 2</span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 py-4 text-center border-b">
        <div>รูปภาพ</div>
        <div>
          {carA ? (
            <img src={carA.imageUrl} className="mx-auto h-48 object-contain" />
          ) : (
            <div className="text-gray-400">ไม่มีข้อมูล</div>
          )}
        </div>
        <div>
          {carB ? (
            <img src={carB.imageUrl} className="mx-auto h-48 object-contain" />
          ) : (
            <div className="text-gray-400">ไม่มีข้อมูล</div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 py-4 text-center border-b">
        <div>ราคา</div>
        <div>{carA ? `${carA.price.toLocaleString()} บาท` : "–"}</div>
        <div>{carB ? `${carB.price.toLocaleString()} บาท` : "–"}</div>
      </div>

      <div className="grid grid-cols-3 gap-4 py-4 text-center border-b">
        <div>ประเภทน้ำมัน</div>
        <div>{carA?.fuel || "–"}</div>
        <div>{carB?.fuel || "–"}</div>
      </div>

      <div className="grid grid-cols-3 gap-4 py-4 text-center border-b">
        <div>รายละเอียด</div>
        <div className="whitespace-pre-wrap">{carA?.detail || "–"}</div>
        <div className="whitespace-pre-wrap">{carB?.detail || "–"}</div>
      </div>
    </div>
  );
};

export default ComparePage;

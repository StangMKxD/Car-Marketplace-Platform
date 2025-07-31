"use client";

import { addFavorite, bookTestDrive, removeFavorite } from "@/api/user";
import type { Cartype } from "@/types";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FaHeart } from "react-icons/fa";
import { toast } from "react-toastify";

type ListProps = {
  item: Cartype;
  isLoggedIn: boolean;
  initialIsFavorite?: boolean;
  onFavoriteChange?: (carId: number, isFav: boolean) => void;
  onToggleCompare?: (id: number) => void;
  isCompareSelected?: boolean;
};

const CarList = ({
  item,
  isLoggedIn,
  initialIsFavorite = false,
  onFavoriteChange,
  onToggleCompare,
  isCompareSelected,
}: ListProps) => {
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [bookingDate, setBookingDate] = useState("");
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite);
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  useEffect(() => {
    setIsFavorite(initialIsFavorite);
  }, [initialIsFavorite]);

  const toggleFavorite = async () => {
    if (!isLoggedIn) {
      toast.error("กรุณาเข้าระบบก่อน");
      return;
    }

    setLoading(true);

    try {
      if (isFavorite) {
        await removeFavorite(item.id);
        setIsFavorite(false);
        onFavoriteChange?.(item.id, false);
      } else {
        await addFavorite(item.id);
        setIsFavorite(true);
        toast.success("เพิ่มเข้ารายการโปรดแล้ว");
        onFavoriteChange?.(item.id, true);
      }
    } catch (error) {
      console.error("Favorite toggle error", error);
      toast.error("บางอย่างผิดพลาด โปรดลองอีกครั้ง");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenBookingForm = () => {
    if (!isLoggedIn) {
      toast.error("กรุณาเข้าสู่ระบบก่อนจอง");
      return;
    }
    setShowBookingForm(true);
  };

  const handleBooking = async () => {
    if (!bookingDate) {
      toast.error("กรุณาเลือกวันที่ต้องการจอง");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("กรุณาเข้าสู่ระบบก่อนจอง");
        return;
      }

      await bookTestDrive(item.id, bookingDate, token);

      toast.success("ส่งคำขอจองเรียบร้อยแล้ว");
      setShowBookingForm(false);
      setBookingDate("");
    } catch (error) {
      console.error("Booking Error:", error);
      toast.error("เกิดข้อผิดพลาดในการจอง");
    }
  };

  const handleViewDetail = () => {
    router.push(`/infocar/${item.id}`);
  };

  return (
    <>
      <div className="w-full flex overflow-hidden">
        <div className="flex-1 mx-2 my-2 h-[600px] bg-white rounded-xl p-4 shadow border border-[#dbdbdb] flex flex-col justify-between">
          {/* ส่วนบน */}
          <div>
            <div className="w-full p-2 h-[300px] overflow-hidden rounded-lg border mx-auto border-gray-300">
              {item.imageUrl ? (
                <img
                  src={item.imageUrl}
                  alt={item.model}
                  className="object-cover w-full h-full"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400 italic text-sm">
                  ไม่มีรูปภาพ
                </div>
              )}
            </div>

            <div className="flex w-full justify-center space-x-4 flex-wrap mt-4">
              <div className="my-1 p-2 bg-amber-100 rounded-3xl min-w-[70px] text-center">
                {item.brand}
              </div>
              <div className="my-1 p-2 bg-amber-100 rounded-3xl min-w-[70px] text-center">
                {item.model}
              </div>
              <div className="my-1 p-2 bg-amber-100 rounded-3xl min-w-[80px] text-center">
                {item.price.toLocaleString()} บาท
              </div>
              <div className="my-1 p-2 bg-amber-100 rounded-3xl min-w-[60px] text-center">
                {item.fuel}
              </div>
            </div>

            <div className="mt-4">
              <p className="whitespace-pre-wrap break-words">{item.detail}</p>
            </div>
          </div>

          {/* ปุ่มล่าง */}
          <div className="mt-4 flex justify-between items-center">
            <button
              disabled={loading}
              onClick={toggleFavorite}
              className={`text-2xl cursor-pointer favorite-btn ${
                isFavorite ? "text-red-500" : "text-gray-400"
              }`}
              title={isFavorite ? "ลบออกจากรายการโปรด" : "เพิ่มไปยังรายการโปรด"}
            >
              <FaHeart />
            </button>

            <div className="flex space-x-2">
              {onToggleCompare && (
                <button
                  onClick={() => {
                    if (!isLoggedIn) {
                      toast.error("กรุณาเข้าสู่ระบบก่อน");
                      return;
                    }
                    onToggleCompare(item.id);
                  }}
                  className={`px-3 py-2 rounded cursor-pointer ${
                    isCompareSelected
                      ? "bg-red-500 text-white"
                      : "bg-blue-500 text-white"
                  }`}
                >
                  {isCompareSelected ? "ยกเลิก" : "เปรียบเทียบ"}
                </button>
              )}

              <button
                onClick={handleOpenBookingForm}
                className="bg-blue-500 text-white cursor-pointer px-3 py-2 rounded hover:bg-blue-600"
              >
                ทดลองขับ
              </button>
              <button
                onClick={handleViewDetail}
                className="bg-gray-200 px-3 py-2 rounded hover:bg-gray-300 cursor-pointer"
              >
                ดูเพิ่มเติม
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ฟอร์มจอง */}
      {showBookingForm && (
        <div className="fixed backdrop-blur-md inset-0 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-[90%] max-w-md">
            <h2 className="text-xl mb-4 font-semibold">
              ทดลองขับ: {item.model}
            </h2>
            <label className="block mb-2">
              วันที่ต้องการจอง:
              <input
                type="date"
                className="w-full border p-2 rounded mt-1"
                value={bookingDate}
                onChange={(e) => setBookingDate(e.target.value)}
              />
            </label>
            <div className="flex justify-end mt-4 gap-2">
              <button
                onClick={() => setShowBookingForm(false)}
                className="px-4 py-2 border rounded text-white bg-red-500 hover:bg-red-400"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleBooking}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-400"
              >
                ยืนยันการจอง
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CarList;

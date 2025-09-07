"use client";

import { addFavorite, bookTestDrive, removeFavorite } from "@/api/user";
import type { Cartype } from "@/types";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { FaHeart } from "react-icons/fa";
import { toast } from "react-toastify";
import CompareButton from "./CompareButton";
import { createPortal } from "react-dom";
import { PiSteeringWheelFill } from "react-icons/pi";
import { FaMagnifyingGlass } from "react-icons/fa6";

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
    } catch (err) {
      console.error("Favorite toggle error", err);
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
        toast.error("กรุณาเข้าสู่ระบบก่อน");
        return;
      }

      await bookTestDrive(item.id, bookingDate, token);

      toast.success("ส่งคำขอจองเรียบร้อยแล้ว");
      setShowBookingForm(false);
      setBookingDate("");
    } catch (err: any) {
      console.error("Booking Error:", err);
      toast.error(err.message);
    }
  };

  const handleViewDetail = () => {
    router.push(`/infocar/${item.id}`);
  };

  return (
    <>
      <div className="w-full   flex overflow-hidden "> 
        <div className="relative flex-1 mx-2 my-2 h-[500px] bg-white rounded-xl p-4 shadow border border-[#dbdbdb] flex flex-col justify-between overflow-hidden" >
          <div>
            <div className="w-full p-2 h-[300px] overflow-hidden rounded-lg border mx-auto border-gray-300">
              {item.images && item.images.length > 0 ? (
                <img
                  src={`${process.env.NEXT_PUBLIC_BACKEND_URL}${item.images[0].url}`}
                  alt={item.model}
                  className="object-cover w-full h-full"
                />
              ) : (
                <div>โหลดบ่ติด</div>
              )}
            </div>

            <div className="flex w-full justify-center space-x-4 flex-wrap mt-4">
              <div className="my-1 p-2 bg-amber-100 rounded-3xl min-w-[70px] text-center">
                {item.brand}
              </div>
              <div className="my-1 p-2 bg-amber-100 rounded-3xl min-w-[70px] text-center">
                {item.model}
              </div>
              <div className="border absolute top-10 -right-18 transform rotate-45 px-10 py-2 bg-red-500 min-w-[80px] text-center text-white font-bold text-2xl">
                {item.price.toLocaleString()} บาท
              </div>
              <div className="my-1 p-2 bg-amber-100 rounded-3xl min-w-[60px] text-center">
                {item.fuel}
              </div>
            </div>
          </div>

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
              <CompareButton car={item} />
              <button
                onClick={handleOpenBookingForm}
                className="bg-blue-500 text-white cursor-pointer px-3 py-2 rounded hover:bg-blue-600"
              >
                <PiSteeringWheelFill size={28} />
              </button>
              <button
                onClick={handleViewDetail}
                className="bg-gray-200 px-3 py-2 rounded hover:bg-gray-300 cursor-pointer"
              >
                <FaMagnifyingGlass size={28} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {showBookingForm &&
        createPortal(
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
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
                  className="px-4 py-2 border rounded cursor-pointer text-white bg-red-500 hover:bg-red-400"
                >
                  ยกเลิก
                </button>
                <button
                  onClick={handleBooking}
                  className="px-4 py-2 bg-green-500 cursor-pointer text-white rounded hover:bg-green-400"
                >
                  ยืนยันการจอง
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
};

export default CarList;

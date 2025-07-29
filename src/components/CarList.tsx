"use client"

import { addFavorite, removeFavorite } from "@/api/car";
import type { Cartype } from "@/types";
import { useEffect, useState } from "react";
import { FaHeart } from "react-icons/fa";
import { toast } from "react-toastify";

type ListProps = {
  item: Cartype;
  isLoggedIn: boolean;
  initialIsFavorite?: boolean;
  onFavoriteChange?: (carId: number, isFav: boolean) => void;
};

const CarList = ({ item, isLoggedIn, initialIsFavorite = false, onFavoriteChange }: ListProps) => {
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setIsFavorite(initialIsFavorite)
  }, [initialIsFavorite])

  const toggleFavorite = async () => {
    if (!isLoggedIn) {
      toast.error("กรุณาเข้าระบบก่อนกดบันทึกรายการโปรด")
      return
    }

    setLoading(true)

    try {
      if (isFavorite) {
        await removeFavorite(item.id)
        setIsFavorite(false)
        onFavoriteChange?.(item.id, false)
      } else {
        await addFavorite(item.id)
        setIsFavorite(true)
        onFavoriteChange?.(item.id, true)
      }
    } catch (error) {
      console.error("Favorite toggle error", error)
      toast.error("บางอย่างผิดพลาด โปรดลองอีกครั้ง")
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="w-full relative overflow-hidden">
      <div className="flex-1 mx-2 my-2 h-[600px] bg-white rounded-xl p-4 shadow border border-[#dbdbdb]">
        {/* แสดงรูปภาพ */}
        <div className="w-full p-2 h-[300px] flex-shrink-0 overflow-hidden rounded-lg border mx-auto border-gray-300">
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

        {/* ข้อมูลรถ */}
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

        {/* รายละเอียดเพิ่มเติม */}
        <div className="mt-4">
          <p className="whitespace-pre-wrap break-words">{item.detail}</p>
        </div>

        
        {isLoggedIn && (
        <button
          disabled={loading}
          onClick={toggleFavorite}
          className={`absolute bottom-5 right-5 text-2xl cursor-pointer favorite-btn ${isFavorite ? "text-red-500" : "text-gray-400"}`}
          title={isFavorite ? "ลบออกจากรายการโปรด" : "เพิ่มไปยังรายการโปรด"}
        >
          <FaHeart />
        </button>
      )}


      </div>
      </div>
      
    </>
  );
};

export default CarList;

"use client";

import { getPopularCarsBookings, getPopularCarsFavorites } from "@/api/user";
import { Cartype } from "@/types";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const Page = () => {
  const [mostBookings, setMostBookings] = useState<Cartype[]>([]);
  const [mostFavorites, setMostFavorites] = useState<Cartype[]>([]);
  const [activeTab, setActiveTab] = useState<"pplbookings" | "pplfavorites">("pplbookings");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const router = useRouter();

  useEffect(() => {
    const fetchMostBookings = async () => {
      const res = await getPopularCarsBookings();
      setMostBookings(res || []);
    };

    const fetchMostFavorites = async () => {
      const res = await getPopularCarsFavorites();
      setMostFavorites(res || []);
    };

    fetchMostBookings();
    fetchMostFavorites();
  }, []);

  const handleViewDetail = (id: number) => {
    router.push(`/infocar/${id}`);
  };

  const closeModal = () => {
    setSelectedImage(null);
  };

  const ImageModal = () =>
    selectedImage ? (
      <div
        className="fixed inset-0 backdrop-blur-md flex justify-center items-center z-50"
        onClick={closeModal}
      >
        <img
          src={selectedImage}
          alt="full"
          className="max-w-[90%] max-h-[90%] rounded-lg shadow-lg"
          onClick={(e) => e.stopPropagation()} // กันไม่ให้คลิกปิดตอนคลิกบนรูป
        />
      </div>
    ) : null;

  const CarCard = ({ car }: { car: Cartype }) => (
    <div
      key={car.id}
      className="w-full p-2 h-[500px] overflow-hidden rounded-lg border border-gray-300"
    >
      {car.images && car.images.length > 0 ? (
        <img
          src={`${process.env.NEXT_PUBLIC_BACKEND_URL}${car.images[0].url}`}
          alt={car.model}
          className="object-cover w-full h-[360px] cursor-pointer hover:opacity-80"
          onClick={() =>
            setSelectedImage(`${process.env.NEXT_PUBLIC_BACKEND_URL}${car.images[0].url}`)
          }
        />
      ) : (
        <div className="flex items-center justify-center h-[300px] text-gray-400 italic text-sm">
          ไม่มีรูปภาพ
        </div>
      )}

      <div className="flex w-full justify-center space-x-4 flex-wrap mt-4">
        <div className="my-1 p-2 bg-amber-100 rounded-3xl min-w-[70px] text-center">
          {car.brand}
        </div>
        <div className="my-1 p-2 bg-amber-100 rounded-3xl min-w-[70px] text-center">
          {car.model}
        </div>
        <div className="my-1 p-2 bg-amber-100 rounded-3xl min-w-[80px] text-center">
          {car.price.toLocaleString()} บาท
        </div>
        <div className="my-1 p-2 bg-amber-100 rounded-3xl min-w-[60px] text-center">
          {car.fuel}
        </div>
      </div>
      <div className="flex justify-end">
        <button
          onClick={() => handleViewDetail(car.id)}
          className="mt-4 bg-gray-200 px-3 py-2 rounded hover:bg-gray-300 cursor-pointer"
        >
          ดูเพิ่มเติม
        </button>
      </div>
    </div>
  );

  return (
    <>
      <div className="flex justify-center items-center bg-amber-300 w-full h-svh">
        <h1 className="text-8xl text-center">Banner</h1>
      </div>
      <div className="my-4">
        <h1 className="text-3xl text-center">รถยอดนิยมประจำสัปดาห์</h1>
        <div className="relative mb-14">
          <div className="absolute top-0 right-0 space-x-2 ">
            <button
              onClick={() => setActiveTab("pplbookings")}
              className={`px-4 py-2 rounded  ${
                activeTab === "pplbookings"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 cursor-pointer"
              }`}
            >
              รถที่ถูกจองมากที่สุดในสัปดาห์นี้
            </button>

            <button
              onClick={() => setActiveTab("pplfavorites")}
              className={`px-4 py-2 rounded  ${
                activeTab === "pplfavorites"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 cursor-pointer"
              }`}
            >
              รถที่ถูกใจมากที่สุดในสัปดาห์นี้
            </button>
          </div>
        </div>

        {activeTab === "pplbookings" && (
          <>
            {mostBookings.length === 0 ? (
              <div className="flex justify-center items-center h-[60vh]">
                <p className="text-center text-gray-400 text-xl">ไม่มีข้อมูลรถ</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {mostBookings.map((car) => (
                  <CarCard key={car.id} car={car} />
                ))}
              </div>
            )}
          </>
        )}

        {activeTab === "pplfavorites" && (
          <>
            {mostFavorites.length === 0 ? (
              <div className="flex justify-center items-center h-[60vh]">
                <p className="text-center text-gray-400 text-xl">ไม่มีข้อมูลรถ</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {mostFavorites.map((car) => (
                  <CarCard key={car.id} car={car} />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal แสดงรูปเต็ม */}
      <ImageModal />
    </>
  );
};

export default Page;

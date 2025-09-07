"use client";

import {
  getNewCar,
  getPopularCarsBookings,
  getPopularCarsFavorites,
} from "@/api/user";
import { Cartype } from "@/types";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const Page = () => {
  const [mostBookings, setMostBookings] = useState<Cartype[]>([]);
  const [mostFavorites, setMostFavorites] = useState<Cartype[]>([]);
  const [newCar, setNewCar] = useState<Cartype[]>([]);
  const [activeTab, setActiveTab] = useState<
    "pplbookings" | "pplfavorites" | "newcar"
  >("pplbookings");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const router = useRouter();

  const tabs = [
    { id: "newcar", label: "รถเข้าใหม่" },
    { id: "pplbookings", label: "รถที่ถูกจองมากที่สุด" },
    { id: "pplfavorites", label: "รถที่ถูกใจมากที่สุด" },
  ];

  useEffect(() => {
    const fetchData = async () => {
      const [bookings, favorites, newCars] = await Promise.all([
        getPopularCarsBookings(),
        getPopularCarsFavorites(),
        getNewCar(),
      ]);
      setMostBookings(bookings || []);
      setMostFavorites(favorites || []);
      setNewCar(newCars.cars || []);
    };
    fetchData();
  }, []);

  const handleViewDetail = (id: number) => {
    router.push(`/infocar/${id}`);
  };

  const closeModal = () => setSelectedImage(null);

  const ImageModal = () =>
    selectedImage ? (
      <div
        className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4"
        onClick={closeModal}
      >
        <img
          src={selectedImage}
          alt="full"
          className="max-w-full max-h-full rounded-lg shadow-lg object-contain"
          onClick={(e) => e.stopPropagation()}
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
            setSelectedImage(
              `${process.env.NEXT_PUBLIC_BACKEND_URL}${car.images?.[0]?.url}`
            )
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
      {/* Banner */}
      <div className="flex relative justify-center items-center w-full h-svh pt-20 bg-[url(/banner.jpg)]">
      </div>

      {/* รถยอดนิยม */}
      <div className="my-3 px-4">
        <h1 className="text-3xl text-center mb-4">รถยอดนิยมประจำสัปดาห์</h1>

        {/* Tabs */}
        <div className="flex justify-center space-x-4 relative border-b border-gray-300">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 cursor-pointer transition-colors ${
                activeTab === tab.id
                  ? "text-blue-600 font-bold"
                  : "text-gray-500 hover:text-blue-600"
              }`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <motion.div
                  layoutId="activeTabUnderline"
                  className="absolute bottom-0 left-0 right-0 h-[3px] bg-blue-600 rounded-t"
                />
              )}
            </button>
          ))}
        </div>

        {/* Content with animation */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab} 
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-6"
          >
            {activeTab === "newcar" &&
              (newCar.length === 0 ? (
                <p className="col-span-full text-center text-gray-500">
                  ไม่มีรถเข้าใหม่
                </p>
              ) : (
                newCar.map((car) => <CarCard key={car.id} car={car} />)
              ))}

            {activeTab === "pplbookings" &&
              (mostBookings.length === 0 ? (
                <p className="col-span-full text-center text-gray-500">
                  ไม่มีรถที่ถูกจอง
                </p>
              ) : (
                mostBookings.map((car) => <CarCard key={car.id} car={car} />)
              ))}

            {activeTab === "pplfavorites" &&
              (mostFavorites.length === 0 ? (
                <p className="col-span-full text-center text-gray-500">
                  ไม่มีรถที่ถูกใจ
                </p>
              ) : (
                mostFavorites.map((car) => <CarCard key={car.id} car={car} />)
              ))}
          </motion.div>
        </AnimatePresence>
      </div>

      <ImageModal />
    </>
  );
};

export default Page;

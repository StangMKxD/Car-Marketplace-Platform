"use client";

import { getData, getFavorites } from "@/api/user";
import CarList from "@/components/CarList";
import { Cartype } from "@/types";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { AnimatePresence, motion } from "framer-motion"

const carTypes = [
  { id: "ALL", label: "รถทั้งหมด"},
  { id: "SEDAN", label: "รถเก๋ง"},
  { id: "PICKUP4", label: "กระบะ 4 ประตู"},
  { id: "PICKUP", label: "กระบะ"},
  { id: "MPV", label: "รถ 7 ที่นั่ง"},
];

const typeMapping: Record<string, string> = {
  ALL: "ALL",
  SEDAN: "รถเก๋ง",
  PICKUP4: "กระบะ4ประตู",
  PICKUP: "กระบะ",
  MPV: "รถ7ที่นั่ง",
};

const CarPage = () => {
  const [cars, setCars] = useState<Cartype[]>([]);
  const [activeTab, setActiveTab] = useState(carTypes[0].id);
  const { isLoggedIn } = useAuth();
  const [favoriteIds, setFavoriteIds] = useState<number[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const data = await getData();
      if (Array.isArray(data)) setCars(data);
      else setCars(data.cars || []);
    };

    const fetchFavorites = async () => {
      const data = await getFavorites();
      setFavoriteIds(data.map((car: Cartype) => car.id));
    };

    fetchData();

    if (isLoggedIn) {
      fetchFavorites();
    }
  }, [isLoggedIn]);

  
  useEffect(() => {
  console.log("Cars data:", cars.map(c => c.type));
}, [cars]);

  const filteredCars =
  activeTab === "ALL"
    ? cars
    : cars.filter((car) => car.type === typeMapping[activeTab]);

  return (
    <>
      <div className="pt-20 px-2">
        <div className="flex space-x-4 border-b-2 border-b-[#f1f1f1] mb-6 overflow-x-auto relative">
        {carTypes.map((type) => (
          <button
            key={type.id}
            onClick={() => setActiveTab(type.id)}
            className={`relative flex flex-col items-center px-4 py-2 rounded-t-lg cursor-pointer transition-colors
              ${
                activeTab === type.id
                  ? "text-blue-600 font-bold"
                  : "text-gray-500 hover:text-blue-600"
              }`}
          >
            <span className="text-sm mt-1">{type.label}</span>

            {activeTab === type.id && (
              <motion.div
                layoutId="activeTabUnderline"
                className="absolute bottom-0 left-0 right-0 h-[3px] bg-blue-600 rounded-t"
              />
            )}
          </button>
        ))}
      </div>

        <AnimatePresence mode="wait">
        <motion.div
          key={activeTab} 
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ duration: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-black"
        >
          {filteredCars.length === 0 ? (
            <p className="col-span-full text-center text-gray-500">
              ไม่มีรถประเภทนี้ในระบบ
            </p>
          ) : (
            filteredCars.map((car) => (
              <CarList
                key={car.id}
                item={car}
                isLoggedIn={isLoggedIn}
                initialIsFavorite={favoriteIds.includes(car.id)}
              />
            ))
          )}
        </motion.div>
      </AnimatePresence>
      </div>
    </>
  );
};

export default CarPage;

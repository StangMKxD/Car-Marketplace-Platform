"use client";

import { getData, getFavorites } from "@/api/car";
import CarList from "@/components/CarList";
import { Cartype } from "@/types";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

const carTypes = [
  { id: "ALL", label: "รถทั้งหมด", icon: "" },
  { id: "SEDAN", label: "รถเก๋ง", icon: "" },
  { id: "SUV", label: "7 ที่นั่ง", icon: "" },
  { id: "PICKUP", label: "กระบะ", icon: "" },
  { id: "HEV", label: "HEV", icon: "" },
];

const page = () => {
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
      try {
        const favs = await getFavorites();
        setFavoriteIds(favs.map((car: Cartype) => car.id));
      } catch (err) {
        console.error("โหลดรายการโปรดผิดพลาด", err);
      }
    };

    fetchData();

    if (isLoggedIn) {
      fetchFavorites();
    }
  }, [isLoggedIn]);

  const filteredCars =
    activeTab === "ALL"
      ? cars
      : cars.filter((car) => car.type.toUpperCase() === activeTab);

  return (
    <>
      <div className="p-4">
        {/* แถบเลือกประเภทรถ */}
        <div className="flex space-x-4 border-b mb-6 overflow-x-auto">
          {carTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => setActiveTab(type.id)}
              className={`flex flex-col items-center px-4 py-2 rounded-t-lg cursor-pointer
                ${
                  activeTab === type.id
                    ? "bg-blue-600 text-white shadow-md"
                    : "text-gray-500 hover:text-blue-600"
                }
              `}
              title={type.label}
            >
              <span className="text-2xl">{type.icon}</span>
              <span className="text-sm mt-1">{type.label}</span>
            </button>
          ))}
        </div>

        {/* แสดงรถยนต์ที่กรองตามประเภท */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-black">
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
        </div>
      </div>
    </>
  );
};

export default page;

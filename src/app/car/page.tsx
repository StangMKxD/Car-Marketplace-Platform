"use client";

import { getCompareUser, getData, getFavorites } from "@/api/user";
import CarList from "@/components/CarList";
import { Cartype } from "@/types";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import CompareButton from "@/components/CompareButton";

const carTypes = [
  { id: "ALL", label: "รถทั้งหมด", icon: "" },
  { id: "SEDAN", label: "รถเก๋ง", icon: "" },
  { id: "SUV", label: "7 ที่นั่ง", icon: "" },
  { id: "PICKUP", label: "กระบะ", icon: "" },
  { id: "HEV", label: "HEV", icon: "" },
];

const CarPage = () => {
  const [cars, setCars] = useState<Cartype[]>([]);
  const [activeTab, setActiveTab] = useState(carTypes[0].id);
  const { isLoggedIn } = useAuth();
  const [favoriteIds, setFavoriteIds] = useState<number[]>([]);

  // State ควบคุม fade in
  const [fadeIn, setFadeIn] = useState(false);

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
    setFadeIn(false); 
    const timer = setTimeout(() => {
      setFadeIn(true); 
    }, 200); 

    return () => clearTimeout(timer);
  }, [activeTab]);

  const filteredCars =
    activeTab === "ALL"
      ? cars
      : cars.filter((car) => car.type.toUpperCase() === activeTab);

  return (
    <>
      <div className="p-4">
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

        <div
  className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-black
    transition-transform duration-500 ease-in-out
    ${fadeIn ? "scale-100" : "scale-50"}
  `}
>
  {fadeIn && (filteredCars.length === 0 ? (
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
  ))}
</div>
      </div>
    </>
  );
};

export default CarPage;

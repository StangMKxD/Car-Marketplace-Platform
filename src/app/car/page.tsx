"use client";

import {
  addCompare,
  getCompareUser,
  getData,
  getFavorites,
  removeCompare,
} from "@/api/user";
import CarList from "@/components/CarList";
import { Cartype } from "@/types";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

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
  const [compareIds, setCompareIds] = useState<number[]>([]);
  const [compareIdMap, setCompareIdMap] = useState<{ [carId: number]: number }>(
    {}
  );
  const router = useRouter();

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

    const fetchCompare = async () => {
      try {
        const data = await getCompareUser();
        if (data.length > 0) {
          const ids = [data[0].catAId, data[0].carBId].filter(Boolean);
          setCompareIds(ids);
          const idMap: { [carId: number]: number } = {};
          ids.forEach((id) => {
            const found = data[0];
            if (found.carAId === id || found.carBId === id) {
              idMap[id] = found.id;
            }
          });
          setCompareIdMap(idMap);
        }
      } catch (err: any) {
        console.error("โหลดรายการเปรียบเทียบไม่สำเร็จ", err);
      }
    };

    fetchData();

    if (isLoggedIn) {
      fetchFavorites();
      fetchCompare();
    }
  }, [isLoggedIn]);

  const toggleCompare = async (id: number) => {
    if (compareIds.includes(id)) {
      try {
        const compareIdToDelete = compareIdMap[id];
        await removeCompare(compareIdToDelete);
        setCompareIds(compareIds.filter((i) => i !== id));
        const newMap = { ...compareIdMap };
        delete newMap[id];
        setCompareIdMap(newMap);
      } catch (err) {
        toast.error("ลบรายการไม่สำเร็จ");
      }
    } else {
      if (compareIds.length >= 2) {
        toast.warn("เลือกได้สูงสุด 2 คันเท่านั้น");
        return;
      }

      if (compareIds.length === 1) {
        const carAId = compareIds[0];
        const carBId = id;

        if (carAId === carBId) {
          toast.warn("ไม่สามารถเลือกคันเดียวกันได้");
          return;
        }

        try {
          const res = await addCompare(carAId, carBId);
          setCompareIds([carAId, carBId]);
          setCompareIdMap({ [carAId]: res.id, [carBId]: res.id });
        } catch (err) {
          toast.error("เพิ่มรายการไม่สำเร็จ");
        }
      } else {
        setCompareIds([id]);
      }
    }
  };

  const handleCompare = () => {
    if (compareIds.length !== 2) {
      toast.warn("กรุณาเลือกรถ 2 คันเพื่อเปรียบเทียบ");
      return;
    }
    router.push(`/compare?carA=${compareIds[0]}&carB=${compareIds[1]}`);
  };

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
                onToggleCompare={toggleCompare}
                isCompareSelected={compareIds.includes(car.id)}
              />
            ))
          )}
        </div>
        <div className="fixed bottom-4 right-4">
          <button
            onClick={handleCompare}
            className={`px-6 py-3 rounded-full text-white shadow-lg ${
              compareIds.length === 2 ? "bg-green-600" : "bg-gray-400"
            }`}
          >
            เปรียบเทียบรถ ({compareIds.length}/2)
          </button>
        </div>
      </div>
    </>
  );
};

export default CarPage;

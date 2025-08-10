"use client";
import { useCompare } from "@/contexts/CompareContext";

const ComparePage = () => {
  const { carA, carB, toggle } = useCompare();
  return (
    <div className="grid grid-cols-2 gap-4">
      {[carA, carB].map((car, idx) => (
        <div key={idx} className="border p-4 rounded">
          {car ? (
            <>
              {car && car.images && car.images.length > 0 ? (
                <img
                  src={`${process.env.NEXT_PUBLIC_BACKEND_URL}${car.images[0].url}`}
                  alt={`images of ${car.model}`}
                  className="object-cover w-full h-[400px] rounded-2xl"
                />
              ) : (
                <p>ไม่มีรูปภาพ</p>
              )}
              <div className="flex-1 space-y-2 mt-2">
                <h2 className="text-xl font-bold">{car.model}</h2>
                <p>
                  <b>ยี่ห้อ :</b>
                  {car.brand}
                </p>
                <p>
                  <b>ปี :</b>
                  {car.year}
                </p>
                <p>
                  <b>ประเภทน้ำมัน :</b>
                  {car.fuel}
                </p>
                <p>
                  <b>ราคา :</b>
                  {car.price.toLocaleString()} บาท
                </p>
                <p>
                  <b>เกียร์ :</b>
                  {car.transmission}
                </p>
                <p>
                  <b>ประเภทรถ :</b>
                  {car.type}
                </p>
                <button
                  onClick={() => toggle(car)}
                  className="bg-red-500 text-white rounded-md px-2 py-1 cursor-pointer "
                >
                  ลบออก
                </button>
              </div>
            </>
          ) : (
            <p className="text-gray-400">ไม่มีข้อมูลรถยนต์</p>
          )}
        </div>
      ))}
    </div>
  );
};
export default ComparePage;

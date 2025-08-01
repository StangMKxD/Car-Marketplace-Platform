"use client";

import { getCarById } from "@/api/user";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

const InfoCarPage = () => {
  const params = useParams();
  const [car, setCar] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (params?.id) {
        const data = await getCarById(Number(params.id));
        setCar(data);
      }
    };
    fetchData();
  }, [params?.id]);

  if (!car) return <div>Loading...</div>;
  return (
    <>
      <div className="w-full flex overflow-hidden">
        <div className="flex-1 mx-2 my-2 h-[600px] bg-white rounded-xl p-4 shadow border border-[#dbdbdb] flex flex-col justify-between">
          {/* ส่วนบน */}
          <div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {car.images && car.images.length > 0 ? (
                car.images.map((img: { id: number; url: string }) => (
                  <div
                    key={img.id}
                    className="w-full aspect-video overflow-hidden rounded-lg border"
                  >
                    <img
                      src={`${process.env.NEXT_PUBLIC_BACKEND_URL}${img.url}`}
                      alt={`Image ${img.id}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))
              ) : (
                <div className="text-gray-400 italic">ไม่มีรูปภาพ</div>
              )}
            </div>

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

            <div className="mt-4">
              <p className="whitespace-pre-wrap break-words">{car.detail}</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
export default InfoCarPage;

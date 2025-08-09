"use client";

import { getCarById } from "@/api/user";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

const InfoCarPage = () => {
  const params = useParams();
  const [car, setCar] = useState<any>(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  // สำหรับ modal fullscreen
  const [isOpen, setIsOpen] = useState(false);

  const nextSlide = () => {
    if (!car?.images) return;
    setCurrentSlide((prev) => (prev + 1) % car.images.length);
  };

  const prevSlide = () => {
    if (!car?.images) return;
    setCurrentSlide(
      (prev) => (prev - 1 + car.images.length) % car.images.length
    );
  };

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
    <div className="w-full flex overflow-hidden h-lvh shadow border border-[#dbdbdb] m-1">
      <div className="flex-1 mx-2 my-2 h-[600px] bg-white rounded-xl p-4 flex flex-col justify-between">
        <div className="relative max-w-[800px] mx-auto">
          {/* Slide Images */}
          {car.images && car.images.length > 0 ? (
            <div className="relative overflow-hidden rounded-xl border aspect-video">
              <img
                src={`${process.env.NEXT_PUBLIC_BACKEND_URL}${car.images[currentSlide].url}`}
                alt={`Image ${car.images[currentSlide].id}`}
                className="w-full h-full object-cover transition-all duration-500 cursor-pointer"
                onClick={() => setIsOpen(true)} // เปิด fullscreen
              />
              <button
                onClick={prevSlide}
                className="absolute top-1/2 left-2 -translate-y-1/2 bg-black/50 text-white px-3 py-1 cursor-pointer rounded-full"
              >
                ❮
              </button>
              <button
                onClick={nextSlide}
                className="absolute top-1/2 right-2 -translate-y-1/2 bg-black/50 text-white px-3 py-1 cursor-pointer rounded-full"
              >
                ❯
              </button>
            </div>
          ) : (
            <div className="text-gray-400 italic">ไม่มีรูปภาพ</div>
          )}

          <div className="flex overflow-x-auto space-x-2 mt-4 px-2">
            {car.images.map((img: any, idx: number) => (
              <img
                key={idx}
                src={`${process.env.NEXT_PUBLIC_BACKEND_URL}${img.url}`}
                alt={`Thumbnail ${idx}`}
                onClick={() => {
                  setCurrentSlide(idx);
                  setIsOpen(true); // เปิด fullscreen เมื่อกด thumbnail
                }}
                className={`h-20 w-32 object-cover rounded-md border-2 cursor-pointer transition-all ${
                  currentSlide === idx
                    ? "border-blue-500 scale-105"
                    : "border-transparent hover:opacity-80"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Info */}
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

        {/* Detail */}
        <div className="mt-4">
          <p className="whitespace-pre-wrap break-words">{car.detail}</p>
        </div>
      </div>

      {/* Fullscreen Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
          <button
            className="absolute top-4 right-4 cursor-pointer text-white text-3xl"
            onClick={() => setIsOpen(false)}
          >
            ✕
          </button>
          <button
            onClick={prevSlide}
            className="absolute left-4 text-white text-5xl cursor-pointer"
          >
            ❮
          </button>
          <img
            src={`${process.env.NEXT_PUBLIC_BACKEND_URL}${car.images[currentSlide].url}`}
            alt={`Full Image ${currentSlide}`}
            className="max-w-[90%] max-h-[90%] object-contain"
          />
          <button
            onClick={nextSlide}
            className="absolute right-4 text-white text-5xl cursor-pointer"
          >
            ❯
          </button>
        </div>
      )}
    </div>
  );
};

export default InfoCarPage;

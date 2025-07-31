"use client";

import { updateProfile, getFavorites, removeFavorite, getUserBooking } from "@/api/user";
import { Cartype, Usertype } from "@/types";
import { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import { MdDone, MdClose } from "react-icons/md";
import { FaRegEdit } from "react-icons/fa";
import CarList from "@/components/CarList";
import BookingList from "./BookingList";

type ListUserProps = {
  item: Usertype;
  loadData: () => void;
};

const ProfileList = ({ item, loadData }: ListUserProps) => {
  const [favorites, setFavorites] = useState<Cartype[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEdit, setIsEdit] = useState(false);
  const [formEdit, setFormEdit] = useState<Usertype>({ ...item });
  const [bookings, setBookings] = useState([]);


  const fields = [
    { name: "name", label: "ชื่อ", type: "text" },
    { name: "surname", label: "นามสกุล", type: "text" },
    { name: "email", label: "อีเมล", type: "email" },
    { name: "phone", label: "เบอร์โทร", type: "text" },
  ];

  const handleEdit = () => {
    setFormEdit({ ...item });
    setIsEdit(true);
  };

  const handleCancel = () => {
    setFormEdit({ ...item });
    setIsEdit(false);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormEdit((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleConfirm = async (id: number) => {
    try {
      await updateProfile(id, formEdit);
      toast.success("แก้ไขโปรไฟล์สำเร็จ");
      setIsEdit(false);
      loadData();
    } catch (error) {
      console.error("Error updating Profile:", error);
      toast.error("แก้ไขไม่สำเร็จ");
    }
  };

  const loadBookings = async () => {
    const res = await getUserBooking();
    setBookings(res);
  };

  useEffect(() => {
    setFormEdit({ ...item }); 
  }, [item]);

  useEffect(() => {
    const loadFavorites = async () => {
      try {
        const favs = await getFavorites();
        setFavorites(favs);
      } catch (err) {
        console.error("โหลดรายการผิดพลาด:", err);
        toast.error("โหลดรายการโปรดไม่สำเร็จ");
      } finally {
        setLoading(false);
      }
    };
    loadBookings()
    loadFavorites();
  }, [item.id]);

  const handleRemoveFavorite = async (carId: number) => {
    try {
      await removeFavorite(carId);
      setFavorites((prev) => prev.filter((car) => car.id !== carId));
      toast.success("ลบจากรายการโปรดสำเร็จ");
    } catch (error) {
      console.error(error);
      toast.error("ลบไม่สำเร็จ");
    }
  };

  return (
    <>
      <div className="flex overflow-hidden">
        <div className="flex-1 mx-2 my-2 bg-white h-auto rounded-xl p-4 shadow w-full border border-[#dbdbdb] space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">ข้อมูลผู้ใช้</h2>
            {!isEdit && (
              <button
                onClick={handleEdit}
                className="flex items-center gap-1 px-3 py-1 rounded bg-yellow-500 text-white hover:bg-yellow-600"
                title="แก้ไข"
              >
                <FaRegEdit size={16} />
                แก้ไข
              </button>
            )}
          </div>

          {fields.map((field) => (
            <div
              key={field.name}
              className="flex items-center justify-between bg-amber-100 rounded-3xl p-2"
            >
              {isEdit ? (
                <input
                  type={field.type}
                  name={field.name}
                  value={(formEdit as any)[field.name]}
                  onChange={handleChange}
                  className="border p-2 rounded w-full mr-3"
                />
              ) : (
                <span className="flex-1">
                  <strong>{field.label}:</strong> {(item as any)[field.name]}
                </span>
              )}
            </div>
          ))}

          {isEdit && (
            <div className="flex justify-center gap-4 mt-4">
              <button
                onClick={() => handleConfirm(item.id)}
                className="flex items-center gap-1 px-4 py-2 rounded bg-green-500 text-white hover:bg-green-600"
              >
                <MdDone size={20} />
                บันทึก
              </button>
              <button
                onClick={handleCancel}
                className="flex items-center gap-1 px-4 py-2 rounded bg-gray-500 text-white hover:bg-gray-600"
              >
                <MdClose size={20} />
                ยกเลิก
              </button>
            </div>
          )}
        </div>
      </div>

      <ToastContainer position="top-right" />

      <div className="p-4">
        <h1 className="text-xl font-bold mb-4">รถยนต์ที่คุณชื่นชอบ</h1>
        {loading ? (
          <p>กำลังโหลด...</p>
        ) : favorites.length === 0 ? (
          <p className="text-gray-500">ยังไม่มีรถยนต์ในรายการโปรด</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-black">
            {favorites.map((car) => (
              <CarList
                key={car.id}
                item={car}
                isLoggedIn={true}
                initialIsFavorite={true}
                onFavoriteChange={(carId, isFav) => {
                  if (!isFav) handleRemoveFavorite(carId);
                }}
              />
            ))}
          </div>
        )}
        <div className="p-4">
      <h2 className="text-xl font-bold mb-4">รายการจองของฉัน</h2>
      <BookingList bookings={bookings} refreshBookings={loadBookings} />
    </div>
      </div>
    </>
  );
};

export default ProfileList;

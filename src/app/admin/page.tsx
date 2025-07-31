"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BookingType, Cartype, Usertype } from "@/types";
import { toast } from "react-toastify";
import { addCar, getBookingList, userData } from "@/api/admin";
import CarListAdmin from "@/components/CarListAdmin";
import UserListAdmin from "@/components/UserListAdmin";
import { getData } from "@/api/user";
import BookingList from "@/components/BookingList";

const AdminPage = () => {
  const router = useRouter();

  const [formData, setFormData] = useState<Cartype>({
    id: 0,
    brand: "",
    model: "",
    year: 0,
    price: 0,
    type: "",
    fuel: "",
    transmission: "",
    imageUrl: "",
    detail: "",
  });

  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [cars, setCars] = useState<Cartype[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState<"cars" | "users" | "bookinglist">(
    "cars"
  );
  const [users, setUsers] = useState<Usertype[]>([]);
  const [bookings, setBookings] = useState<BookingType[]>([]);

  // โหลดข้อมูลรถ
  const loadData = async () => {
    try {
      const res = await getData();
      setCars(res);
    } catch (error) {
      console.error("โหลดข้อมูลรถไม่สำเร็จ:", error);
      toast.error("โหลดข้อมูลรถไม่สำเร็จ");
    }
  };

  // โหลดข้อมูลผู้ใช้
  const loadUsers = async () => {
    try {
      const res = await userData();
      setUsers(res.user || []);
    } catch (error) {
      console.error("โหลดข้อมูลผู้ใช้ไม่สำเร็จ:", error);
      toast.error("โหลดข้อมูลผู้ใช้ไม่สำเร็จ");
    }
  };

  const loadBookings = async () => {
    try {
      const res = await getBookingList();
      setBookings(res);
    } catch (error) {
      console.error("โหลดข้อมูลการจองไม่สำเร็จ", error);
      toast.error("โหลดข้อมูลการจองไม่สำเร็จ");
    }
  };

  useEffect(() => {
    const isAdmin = localStorage.getItem("role") === "ADMIN";
    if (!isAdmin) {
      router.push("/login");
    } else {
      loadData();
      loadUsers();
      loadBookings();
    }
  }, [router]);

  // ฟังก์ชันเปลี่ยนแปลงค่าในฟอร์ม
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ฟังก์ชันเปลี่ยนไฟล์ภาพที่เลือก
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedFiles(e.target.files);
  };

  // ฟังก์ชันเพิ่มรถพร้อมอัปโหลดไฟล์
  const handleAddData = async () => {
    if (!formData.brand.trim()) {
      toast.error("กรุณากรอกยี่ห้อรถ");
      return;
    }
    if (!selectedFiles || selectedFiles.length === 0) {
      toast.error("กรุณาเลือกไฟล์ภาพ");
      return;
    }

    const formDataToSend = new FormData();

    // Append ข้อมูล text fields
    formDataToSend.append("brand", formData.brand);
    formDataToSend.append("model", formData.model);
    formDataToSend.append("year", String(formData.year));
    formDataToSend.append("fuel", formData.fuel);
    formDataToSend.append("price", String(formData.price));
    formDataToSend.append("transmission", formData.transmission);
    formDataToSend.append("detail", formData.detail);
    formDataToSend.append("type", formData.type);

    // Append รูปภาพ (ชื่อฟิลด์ต้องตรงกับ multer ใน backend)
    for (let i = 0; i < selectedFiles.length; i++) {
      formDataToSend.append("images", selectedFiles[i]);
    }

    try {
      const token = localStorage.getItem("token") || "";
      const res = await addCar(formDataToSend, token);

      toast.success(`เพิ่มรถ ${res.data.car.brand} สำเร็จ`);
      setFormData({
        id: 0,
        brand: "",
        model: "",
        year: 0,
        price: 0,
        type: "",
        fuel: "",
        transmission: "",
        imageUrl: "",
        detail: "",
      });
      setSelectedFiles(null);
      loadData();
      setShowForm(false);
    } catch (error) {
      toast.error("เพิ่มรถล้มเหลว");
      console.error("Error:", error);
    }
  };

  const fields = [
    { name: "brand", placeholder: "ยี่ห้อ", type: "text" },
    { name: "model", placeholder: "รุ่น", type: "text" },
    { name: "fuel", placeholder: "เชื้อเพลิง", type: "text" },
    { name: "year", placeholder: "ปี", type: "number" },
    { name: "transmission", placeholder: "เกียร์", type: "text" },
    { name: "type", placeholder: "ประเภทรถ", type: "text" },
    { name: "detail", placeholder: "รายละเอียด", type: "text" },
    { name: "price", placeholder: "ราคา", type: "number" },
  ];

  const handleDeleteUser = (id: number) => {
    setUsers((prevUsers) => prevUsers.filter((user) => user.id !== id));
  };

  return (
    <div className="p-4">
      {/* แท็บสลับ */}
      <div className="flex space-x-4 mb-6 ">
        <button
          onClick={() => setActiveTab("cars")}
          className={`px-4 py-2 rounded  ${
            activeTab === "cars"
              ? "bg-blue-600 text-white "
              : "bg-gray-200 cursor-pointer"
          }`}
        >
          รถยนต์ทั้งหมด
        </button>

        <button
          onClick={() => setActiveTab("users")}
          className={`px-4 py-2 rounded  ${
            activeTab === "users"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 cursor-pointer"
          }`}
        >
          ผู้ใช้งาน
        </button>

        <button
          onClick={() => setActiveTab("bookinglist")}
          className={`px-4 py-2 rounded  ${
            activeTab === "bookinglist"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 cursor-pointer"
          }`}
        >
          รายการจอง
        </button>
      </div>

      {/* เนื้อหาตามแท็บ */}
      {activeTab === "cars" && (
        <>
          <div className="mb-4">
            <button
              onClick={() => setShowForm(!showForm)}
              className="bg-green-500 text-white rounded px-4 py-2 cursor-pointer"
            >
              {showForm ? "ปิดฟอร์ม" : "เพิ่มรถใหม่"}
            </button>
          </div>

          {showForm && (
            <div className="space-y-2 mb-6">
              {/* input รูปภาพ */}
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileChange}
                className="border rounded p-1"
              />

              {/* input ฟอร์มข้อมูลรถ */}
              {fields.map(({ name, placeholder, type }) => (
                <input
                  key={name}
                  name={name}
                  type={type}
                  placeholder={placeholder}
                  value={formData[name as keyof Cartype] || ""}
                  onChange={handleChange}
                  className="w-full border px-2 py-1 rounded"
                />
              ))}

              <button
                onClick={handleAddData}
                className="bg-blue-500 text-white rounded px-4 py-2"
              >
                ยืนยันเพิ่มรถ
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-black">
            {cars.map((car, index) => (
              <CarListAdmin key={index} item={car} loadData={loadData} />
            ))}
          </div>
        </>
      )}

      {activeTab === "users" && (
        <div className="text-black ">
          <h2 className="text-3xl font-bold text-center my-5">รายชื่อสมาชิก</h2>
          {users.map((user, index) => (
            <UserListAdmin
              key={index}
              user={user}
              onDelete={handleDeleteUser}
            />
          ))}
        </div>
      )}

      {activeTab === "bookinglist" && (
        <div className="p-4">
          <h2 className="text-xl text-center">รายการจองที่รออนุมัติ</h2>
          <BookingList bookings={bookings} refreshBookings={loadBookings} />
        </div>
      )}
    </div>
  );
};

export default AdminPage;

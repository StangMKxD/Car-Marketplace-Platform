"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BookingType, Cartype, Usertype } from "@/types";
import { toast } from "react-toastify";
import {
  addCar,
  adminDashboard,
  getAlert,
  getBookingList,
  sellCar,
  userData,
} from "@/api/admin";
import CarListAdmin from "@/components/CarListAdmin";
import UserListAdmin from "@/components/UserListAdmin";
import { getData } from "@/api/user";
import BookingList from "@/components/BookingList";
import { FaUserCircle } from "react-icons/fa";
import { FaRegBell, FaRegBellSlash } from "react-icons/fa6";
import { BiSolidCar } from "react-icons/bi";
import { PiSteeringWheelFill } from "react-icons/pi";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { motion, AnimatePresence } from "framer-motion";

interface AlertType {
  type: string;
  stock: number;
  status: "low" | "high" | "ok";
  min: number;
  max: number;
}

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
    images: [],
    detail: "",
  });

  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [cars, setCars] = useState<Cartype[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "dashboard" | "cars" | "users" | "bookinglist"
  >("dashboard");
  const [users, setUsers] = useState<Usertype[]>([]);
  const [bookings, setBookings] = useState<BookingType[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalCars, setTotalCars] = useState(0);
  const [totalBookings, setTotalBookings] = useState(0);
  const [totalApproved, setTotalApproved] = useState(0);
  const [totalRejected, setTotalRejected] = useState(0);
  const [totalSoldCars, setTotalSoldCars] = useState(0);
  const [popularCars, setPopularCars] = useState<Cartype[]>([]);
  const [data, setData] = useState<
    { name: string; users: number; bookings: number }[]
  >([]);
  const [carTypeData, setCarTypeData] = useState<
    { name: string; จำนวนรถ: number }[]
  >([]);
  const [alerts, setAlerts] = useState<AlertType[]>([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [soldCars, setSoldCars] = useState<
    {
      name: string;
      carsIn: number;
      carsInPrice: number;
      carsOut: number;
      carsOutPrice: number;
    }[]
  >([]);
  const [totalSold, setTotalSold] = useState(0);

  const loadAlert = async () => {
    try {
      const res = await getAlert();
      setAlerts(res);
    } catch (err) {
      console.error("โหลดการเตือนไม่สำเร็จ", err);
      toast.error("โหลดการเตือนไม่สำเร็จ");
    }
  };

  const loadData = async () => {
    try {
      const res = await getData();
      setCars(res);
    } catch (err) {
      console.error("โหลดข้อมูลรถไม่สำเร็จ:", err);
      toast.error("โหลดข้อมูลรถไม่สำเร็จ");
    }
  };

  const loadUsers = async () => {
    try {
      const res = await userData();
      setUsers(res.user || []);
    } catch (err) {
      console.error("โหลดข้อมูลผู้ใช้ไม่สำเร็จ:", err);
      toast.error("โหลดข้อมูลผู้ใช้ไม่สำเร็จ");
    }
  };

  const loadBookings = async () => {
    try {
      const res = await getBookingList();
      setBookings(res);
    } catch (err) {
      console.error("โหลดข้อมูลการจองไม่สำเร็จ", err);
      toast.error("โหลดข้อมูลการจองไม่สำเร็จ");
    }
  };

  const loadAdminDashboardStats = async () => {
    try {
      const res = await adminDashboard();
      console.log("admindashboard", res);

      setSoldCars(res.monthyCars);
      setTotalUsers(res.totalUsers);
      setTotalCars(res.totalCars);
      setTotalBookings(res.totalBookingsCars);
      setTotalPrice(res.totalPrice);
      setTotalSold(res.totalSold);
      setPopularCars(res.popularCars);
      setData(res.monthyStats);
      setTotalApproved(res.approvedCount);
      setTotalRejected(res.rejectedCount);
      setTotalSoldCars(res.totalCarSoldCount);
      setCarTypeData(res.carTypeData);
    } catch (err) {
      console.error("โหลดข้อมูลไม่สำเร็จ", err);
      toast.error("โหลดข้อมูลไม่สำเร็จ");
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
      loadAdminDashboardStats();
      loadAlert();
    }
  }, [router]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedFiles(e.target.files);
  };

  const handleSellCar = async (carId: number) => {
    try {
      await sellCar(carId);
      toast.success("ขายรถสำเร็จ");
    } catch (err) {
      console.error(err);
      toast.error("ขายรถไม่สำเร็จ");
    }
  };

  const handleAddData = async () => {
    if (!formData.brand.trim()) {
      toast.error("กรุณากรอกข้อมูลให้ครบ");
      return;
    }
    if (!selectedFiles || selectedFiles.length === 0) {
      toast.error("กรุณาเลือกไฟล์ภาพ");
      return;
    }

    const formDataToSend = new FormData();

    formDataToSend.append("brand", formData.brand);
    formDataToSend.append("model", formData.model);
    formDataToSend.append("year", String(formData.year));
    formDataToSend.append("fuel", formData.fuel);
    formDataToSend.append("price", String(formData.price));
    formDataToSend.append("transmission", formData.transmission);
    formDataToSend.append("detail", formData.detail);
    formDataToSend.append("type", formData.type);

    for (let i = 0; i < selectedFiles.length; i++) {
      formDataToSend.append("images", selectedFiles[i]);
    }

    try {
      const token = localStorage.getItem("token") || "";
      const res = await addCar(formDataToSend, token);

      toast.success(`เพิ่มรถ ${res.car.brand} สำเร็จ`);

      setFormData({
        id: 0,
        brand: "",
        model: "",
        year: 0,
        price: 0,
        type: "",
        fuel: "",
        transmission: "",
        images: [],
        detail: "",
      });
      setSelectedFiles(null);
      setShowForm(false);

      await loadData();
      await loadAdminDashboardStats();
      await loadAlert();
    } catch (err) {
      toast.error("เพิ่มรถล้มเหลว");
      console.error("Error:", err);
    }
  };

  const fields = [
    { name: "brand", placeholder: "ยี่ห้อ", type: "text" },
    { name: "model", placeholder: "รุ่น", type: "text" },
    { name: "fuel", placeholder: "เชื้อเพลิง", type: "text" },
    { name: "year", placeholder: "ปี", type: "number" },
    { name: "price", placeholder: "ราคา", type: "number" },
  ];

  const handleDeleteUser = (id: number) => {
    setUsers((prevUsers) => prevUsers.filter((user) => user.id !== id));
  };

  return (
    <>
      <div className="flex pt-14">
        <div className="fixed left-0 top-0 mt-[60px] bg-[#f1f1f1] border-r border-r-[#f1f1f1] w-[200px] h-dvh">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`block w-full text-left my-2 px-4 py-2 rounded  ${
              activeTab === "dashboard"
                ? "bg-black text-white"
                : "bg-[#f1f1f1] cursor-pointer"
            }`}
          >
            Admin Dashboard
          </button>
          <button
            onClick={() => setActiveTab("cars")}
            className={`block w-full text-left my-2 px-4 py-2 rounded  ${
              activeTab === "cars"
                ? "bg-black text-white"
                : "bg-[#f1f1f1] cursor-pointer"
            }`}
          >
            จัดการรถยนต์ทั้งหมด
          </button>
          <button
            onClick={() => setActiveTab("users")}
            className={`block w-full text-left my-2 px-4 py-2 rounded  ${
              activeTab === "users"
                ? "bg-black text-white"
                : "bg-[#f1f1f1] cursor-pointer"
            }`}
          >
            จัดการผู้ใช้งาน
          </button>
          <button
            onClick={() => setActiveTab("bookinglist")}
            className={`block w-full text-left my-2 px-4 py-2 rounded  ${
              activeTab === "bookinglist"
                ? "bg-black text-white"
                : "bg-[#f1f1f1] cursor-pointer"
            }`}
          >
            จัดการรายการจอง
          </button>
        </div>

        <div className="flex-1 ml-[200px] p-4">
          {activeTab === "dashboard" && (
            <>
              <div className="w-full">
                <div className="flex justify-between border-b border-[#f0f0f0] p-4 items-center">
                  <div>
                    <h1 className="text-xl font-bold">Dashboard</h1>
                  </div>
                  <div>
                    <div className="relative mx-6 ">
                      <button
                        onClick={() => setShowForm(!showForm)}
                        className=" text-white rounded flex items-center justify-center relative"
                      >
                        <div className="relative ">
                          {showForm ? (
                            <FaRegBellSlash
                              size={28}
                              className="text-amber-300 stroke-3 cursor-pointer"
                            />
                          ) : (
                            <FaRegBell
                              size={28}
                              className="text-amber-300 stroke-2 cursor-pointer"
                            />
                          )}

                          {!showForm &&
                            alerts.some((a) => a.status === "low") && (
                              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping"></span>
                            )}
                        </div>
                      </button>

                      {showForm && (
                        <div className="relative ">
                          <AnimatePresence>
                            <motion.div
                              initial={{ opacity: 0, y: -20 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -20 }}
                              transition={{ duration: 0.3 }}
                              className="absolute right-1 top-1 p-4 w-[380px] h-auto shadow hover:shadow-lg rounded-lg bg-white border border-[#b6b6b6] "
                            >
                              <h2 className="font-bold text-xl mb-2">
                                ระบบแจ้งเตือน
                              </h2>

                              {alerts && alerts.length > 0 ? (
                                alerts.map((a: AlertType, index: number) => {
                                  const typeTH = {
                                    SEDAN: "รถเก๋ง",
                                    PICKUP: "กระบะ",
                                    PICKUP4: "กระบะ4ประตู",
                                    MPV: "รถ7ที่นั่ง",
                                  } as const;

                                  const typeName =
                                    a.type as keyof typeof typeTH;

                                  return (
                                    <motion.div
                                      key={index}
                                      initial={{ opacity: 0, x: 50 }}
                                      animate={{ opacity: 1, x: 0 }}
                                      exit={{ opacity: 0, x: 50 }}
                                      transition={{
                                        duration: 0.3,
                                        delay: index * 0.1,
                                      }}
                                      className={`p-2 mb-2 rounded flex items-center gap-2 ${
                                        a.status === "low"
                                          ? "bg-red-200"
                                          : a.status === "high"
                                          ? "bg-yellow-200"
                                          : "hidden"
                                      }`}
                                    >
                                      <b>{typeTH[typeName]}</b>{" "}
                                      <span>
                                        {a.status === "low"
                                          ? "ขาด stock"
                                          : a.status === "high"
                                          ? "เกิน stock"
                                          : "ปกติ"}
                                      </span>
                                    </motion.div>
                                  );
                                })
                              ) : (
                                <p>ไม่มีข้อมูล stock</p>
                              )}
                            </motion.div>
                          </AnimatePresence>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex justify-around mt-4">
                  <div className="flex justify-between w-1/4 shadow hover:shadow-lg rounded-lg bg-white m-2 p-4">
                    <div className="my-auto">
                      <p className="font-bold text-2xl">{totalUsers}</p>
                      <h1 className="text-[#656565]">จำนวนผู้ใช้</h1>
                    </div>

                    <div className="flex text-4xl items-center">
                      <FaUserCircle />
                    </div>
                  </div>
                  <div className="flex justify-between w-1/4 shadow hover:shadow-lg rounded-lg bg-white m-2 p-4">
                    <div>
                      <p className="font-bold text-2xl">{totalCars}</p>
                      <h1 className="text-[#656565]">จำนวนรถ</h1>
                    </div>
                    <div className="flex text-4xl items-center">
                      <BiSolidCar />
                    </div>
                  </div>
                  <div className="flex justify-between w-1/4 shadow hover:shadow-lg rounded-lg bg-white m-2 p-4">
                    <div className="grid grid-cols-1 items-center">
                      <div className="flex items-center space-x-2">
                        <p className="font-bold text-2xl">{totalBookings}</p>
                        <h1 className="text-[#656565]">รายการจอง</h1>
                      </div>
                      <div className="flex items-center space-x-2">
                        <p className="font-bold text-2xl text-[#6cd000]">
                          {totalApproved}
                        </p>
                        <h1 className="text-[#656565]">อนุมัติ</h1>
                        <p className="font-bold text-2xl text-[#ff6f6f]">
                          {totalRejected}
                        </p>
                        <h1 className="text-[#656565]">ปฏิเสธ</h1>
                      </div>
                    </div>

                    <div className="flex text-4xl items-center">
                      <PiSteeringWheelFill />
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex justify-around w-full p-4 ">
                <div className="p-4 w-[700px] shadow hover:shadow-lg rounded-lg bg-white">
                  <h2 className="text-xl font-bold mb-4 text-center">
                    รายละเอียดรถยนต์
                  </h2>
                  <ResponsiveContainer width={600} height={400}>
                    {soldCars.length > 0 ? (
                      <BarChart data={soldCars}>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          vertical={false}
                          stroke="transparent"
                        />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip
                          content={({ active, payload, label }) => {
                            if (active && payload && payload.length) {
                              const inData = payload.find(
                                (p) => p.dataKey === "carsIn"
                              );
                              const outData = payload.find(
                                (p) => p.dataKey === "carsOut"
                              );

                              return (
                                <div className="bg-white p-2 border rounded shadow">
                                  <p className="font-bold">{label}</p>
                                  {inData && (
                                    <p>
                                      เข้า: {inData.value} คัน มูลค่า{" "}
                                      {inData.payload.carsInPrice.toLocaleString(
                                        "th-TH",
                                        {
                                          style: "currency",
                                          currency: "THB",
                                        }
                                      )}
                                    </p>
                                  )}
                                  {outData && (
                                    <p>
                                      ออก: {outData.value} คัน มูลค่า{" "}
                                      {outData.payload.carsOutPrice.toLocaleString(
                                        "th-TH",
                                        {
                                          style: "currency",
                                          currency: "THB",
                                        }
                                      )}
                                    </p>
                                  )}
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        <Legend
                          formatter={(value) => {
                            if (value === "carsIn") return "รถเข้า";
                            if (value === "carsOut") return "รถออก";
                            return value;
                          }}
                        />

                        <Bar dataKey="carsIn" fill="#9100df" name="รถเข้า" />
                        <Bar dataKey="carsOut" fill="#c06900" name="รถออก" />
                      </BarChart>
                    ) : (
                      <p>กำลังโหลดข้อมูล...</p>
                    )}
                  </ResponsiveContainer>
                </div>

                <div className="items-center p-2 mx-auto w-[350px] shadow hover:shadow-lg rounded-lg bg-white">
                  <h2 className="text-xl font-bold mb-2 text-center">
                    สรุปยอดขาย
                  </h2>

                  <ResponsiveContainer width={350} height={400}>
                    {totalPrice && totalSold ? (
                      <PieChart>
                        <Pie
                          data={[
                            {
                              name: `ยอดขายรวม ${totalSoldCars} คัน`,
                              value: totalSold,
                            },
                            {
                              name: `มูลค่าคลังรวม ${totalCars} คัน`,
                              value: totalPrice,
                            },
                          ]}
                          cx="50%"
                          cy="50%"
                          outerRadius={150}
                          dataKey="value"
                        >
                          <Cell fill="#00ff59" />
                          <Cell fill="#37e4ff" />
                        </Pie>
                        <Tooltip
                          formatter={(value, name) => [
                            value.toLocaleString("th-TH", {
                              style: "currency",
                              currency: "THB",
                            }),
                            name,
                          ]}
                        />
                        <Legend />
                      </PieChart>
                    ) : (
                      <p>กำลังโหลดข้อมูล...</p>
                    )}
                  </ResponsiveContainer>
                </div>

                <div className="p-4 w-[550px] justify-center shadow hover:shadow-lg rounded-lg bg-white">
                  <h2 className="text-xl font-bold mb-4 text-center">
                    จำนวนรถในคลัง
                  </h2>
                  <ResponsiveContainer width={500} height={400}>
                    {carTypeData.length > 0 ? (
                      <BarChart data={carTypeData}>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          vertical={false}
                          stroke="transparent"
                        />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />

                        <Bar dataKey="จำนวนรถ" fill="#8884d8" barSize={50} />
                      </BarChart>
                    ) : (
                      <p>กำลังโหลดข้อมูล...</p>
                    )}
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="flex p-4 justify-around space-x-4">
                <div className="p-4 w-[800px] shadow hover:shadow-lg rounded-lg bg-white">
                  <h2 className="text-xl font-bold mb-4 text-center">
                    จำนวนผู้ใช้ใหม่และการจองทดลองขับในแต่ละเดือน
                  </h2>
                  <ResponsiveContainer width={700} height={400}>
                    {data.length > 0 ? (
                      <BarChart data={data}>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          vertical={false}
                          stroke="transparent"
                        />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip
                          formatter={(value, name) => {
                            if (name === "users") return [value, "ผู้ใช้ใหม่"];
                            if (name === "bookings") return [value, "จองขับรถ"];
                            return [value, name];
                          }}
                        />
                        <Legend
                          formatter={(value) => {
                            if (value === "users") return "ผู้ใช้ใหม่";
                            if (value === "bookings") return "จองขับรถ";
                            return value;
                          }}
                        />
                        <Bar dataKey="users" fill="#00ff59" name="ผู้ใช้ใหม่" />
                        <Bar
                          dataKey="bookings"
                          fill="#0d00ff"
                          name="จองขับรถ"
                        />
                      </BarChart>
                    ) : (
                      <p>กำลังโหลดข้อมูล...</p>
                    )}
                  </ResponsiveContainer>
                </div>
                <div className="max-h-[500px] w-[800px] overflow-y-auto shadow hover:shadow-lg rounded-lg bg-white p-4">
                  <h2 className="text-2xl font-bold mb-4 text-center">
                    จำนวนรถยอดนิยมแต่ละสัปดาห์
                  </h2>
                  <table className="w-full border-collapse">
                    <thead className="sticky top-0 bg-blue-100 z-10">
                      <tr>
                        {[
                          "รุ่น",
                          "โมเดล",
                          "ปี",
                          "น้ำมัน",
                          "ประเภท",
                          "เกียร์",
                          "ราคา(บาท)",
                          "จำนวนการจอง",
                          "จำนวนกดถูกใจ",
                        ].map((title) => (
                          <th
                            key={title}
                            className="border-b-2 border-gray-300 px-4 py-2 text-center text-gray-700 font-semibold"
                          >
                            {title}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {popularCars.map((car) => (
                        <tr
                          key={car.id}
                          className="hover:bg-gray-50 transition-colors duration-200"
                        >
                          <td className="border-b border-gray-200 px-4 py-2 text-center">
                            {car.brand}
                          </td>
                          <td className="border-b border-gray-200 px-4 py-2 text-center">
                            {car.model}
                          </td>
                          <td className="border-b border-gray-200 px-4 py-2 text-center">
                            {car.year}
                          </td>
                          <td className="border-b border-gray-200 px-4 py-2 text-center">
                            {car.fuel}
                          </td>
                          <td className="border-b border-gray-200 px-4 py-2 text-center">
                            {car.type}
                          </td>
                          <td className="border-b border-gray-200 px-4 py-2 text-center">
                            {car.transmission}
                          </td>
                          <td className="border-b border-gray-200 px-4 py-2 text-center">
                            {car.price.toLocaleString()}
                          </td>
                          <td className="border-b border-gray-200 px-4 py-2 text-center">
                            {car.totalBookings}
                          </td>
                          <td className="border-b border-gray-200 px-4 py-2 text-center">
                            {car.totalFavorites}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {activeTab === "cars" && (
            <>
              <AnimatePresence>
                {showForm && (
                  <motion.div
                    initial={{ height: 0 }} 
                    animate={{ height: "auto" }} 
                    exit={{ height: 0 }} 
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                    className="overflow-hidden w-full space-y-2 mb-6 p-2 shadow"
                  >
                 
                    <div className="flex items-center justify-center">
                      <div className=" my-4">
                        <h2 className="flex ml-4 mb-1 font-semibold">
                          เลือกรูปภาพ
                        </h2>
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={handleFileChange}
                          className="border cursor-pointer rounded px-2 py-1 w-[300px]"
                        />
                      </div>
                      <div className="flex flex-col mx-4 my-2">
                        <label
                          htmlFor="transmission"
                          className="mb-1 font-semibold"
                        >
                          เกียร์รถ
                        </label>
                        <select
                          name="transmission"
                          value={formData.transmission}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              transmission: e.target.value,
                            }))
                          }
                          className="border cursor-pointer rounded px-2 py-1 w-[200px]"
                        >
                          <option value="">-- เลือกเกียร์ --</option>
                          <option value="AUTO">เกียร์ออโต้</option>
                          <option value="MANUAL">เกียร์ธรรมดา</option>
                        </select>
                      </div>

                      <div className="flex flex-col mx-4 my-2">
                        <label htmlFor="type" className="mb-1 font-semibold">
                          ประเภทรถ
                        </label>
                        <select
                          name="type"
                          value={formData.type}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              type: e.target.value,
                            }))
                          }
                          className="border cursor-pointer rounded px-2 py-1 w-[200px]"
                        >
                          <option value="">-- เลือกประเภทรถ --</option>
                          <option value="SEDAN">รถเก๋ง</option>
                          <option value="PICKUP">กระบะ</option>
                          <option value="PICKUP4">กระบะ4ประตู</option>
                          <option value="MPV">รถ7ที่นั่ง</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex justify-center space-x-4">
                      {fields
                        .filter(({ name }) => name !== "images")
                        .map(({ name, placeholder, type }) => (
                          <input
                            key={name}
                            name={name}
                            type={type}
                            placeholder={placeholder}
                            value={
                              (formData[name as keyof Cartype] as
                                | string
                                | number) || ""
                            }
                            onChange={handleChange}
                            className="flex w-[150px] border px-2 py-1  rounded"
                          />
                        ))}
                    </div>

                    <div className="flex flex-col mx-auto my-2 w-[800px]">
                      <label
                        htmlFor="detail"
                        className="block w-full text-left mb-1 font-semibold"
                      >
                        รายละเอียด
                      </label>
                      <textarea
                        name="detail"
                        placeholder="รายละเอียด"
                        value={formData.detail || ""}
                        onChange={handleChange}
                        className="border rounded px-2 py-1 w-[800px] h-[100px]"
                      />
                    </div>

                    <div className="flex my-2">
                      <button
                        onClick={handleAddData}
                        className="bg-blue-500 text-white rounded mx-4 cursor-pointer  px-4 py-2"
                      >
                        ยืนยันเพิ่มรถ
                      </button>
                    </div>
                
                  </motion.div>
                )}
              </AnimatePresence>

              <button
                onClick={() => setShowForm((prev) => !prev)}
                className={`px-4 py-2 rounded cursor-pointer transition ${
                  showForm
                    ? "bg-red-500 hover:bg-red-600 text-white"
                    : "bg-green-500 hover:bg-green-600 text-white"
                }`}
              >
                {showForm ? "ยกเลิก" : "เพิ่มรถใหม่"}
              </button>
              <div className="flex-1 gap-4 text-black">
                {cars.map((car, index) => (
                  <CarListAdmin
                    key={index}
                    item={car}
                    loadData={loadData}
                    onSell={handleSellCar}
                  />
                ))}
              </div>
            </>
          )}

          {activeTab === "users" && (
            <div className="text-black mx-2">
              <h2 className="text-3xl font-bold text-center pt-2">
                รายชื่อสมาชิก
              </h2>
              {users.map((user, index) => (
                <UserListAdmin
                  key={index}
                  user={users}
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
      </div>
    </>
  );
};

export default AdminPage;

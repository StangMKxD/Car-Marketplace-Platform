import { updateBookingList } from "@/api/admin";
import { removeBookingList } from "@/api/user";
import { useAuth } from "@/contexts/AuthContext";
import { BookingType } from "@/types";
import { toast } from "react-toastify";

type Props = {
  bookings: BookingType[];
  refreshBookings: () => void;
};

const BookingList = ({ bookings, refreshBookings }: Props) => {
  const { role } = useAuth();

  const handleUpdateStatus = async (
    id: number,
    status: "APPROVED" | "REJECTED"
  ) => {
    try {
      await updateBookingList(id, status);
      toast.success(
        `${status === "APPROVED" ? "อนุมัติ" : "ปฏิเสธ"} รายการนี้แล้ว`
      );
      refreshBookings();
    } catch (err) {
      toast.error("อนุมัติไม่สำเร็จ");
      console.error(err);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await removeBookingList(id);
      toast.success("ลบคำขอแล้ว");
      refreshBookings();
    } catch (err) {
      console.error(err);
      toast.error("ไม่สามารถลบคำขอได้");
    }
  };

  return (
    <>
      <div>
        {bookings.map((booking) => (
          <div
            key={booking.id}
            className="flex justify-between items-center border p-4 rounded shadow my-3"
          >
            <div>
              <div>

              <p>
                <b>ชื่อ:</b> {booking.user?.name} {booking.user?.surname}
              </p>
              <p>
                <b>รุ่น:</b> {booking.car.brand} {booking.car.model} {booking.car.year}
              </p>
              <p>
                <b>วันที่จอง:</b> {new Date(booking.date).toLocaleDateString()}
              </p>
              <p>
                <b>สถานะ:</b>{" "}
                <span
                  className={`ml-1 font-bold ${
                    booking.status === "APPROVED"
                    ? "text-green-600"
                    : booking.status === "REJECTED"
                    ? "text-red-500"
                    : "text-yellow-500"
                  }`}
                  >
                  {booking.status}
                </span>
              </p>
                  </div>

              
            </div>
            <div>
              {["PENDING", "REJECTED"].includes(booking.status) && (
              <button
                onClick={() => handleDelete(booking.id)}
                className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 ml-2"
              >
                ลบคำขอ
              </button>
            )}
                </div>

            {/* ปุ่มอนุมัติ/ปฏิเสธสำหรับ ADMIN และสถานะ PENDING */}
            {role === "ADMIN" && booking.status === "PENDING" && (
              <div className="space-x-2">
                <button
                  className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                  onClick={() => handleUpdateStatus(booking.id, "APPROVED")}
                >
                  อนุมัติ
                </button>
                <button
                  className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                  onClick={() => handleUpdateStatus(booking.id, "REJECTED")}
                >
                  ปฏิเสธ
                </button>

                {["PENDING", "REJECTED"].includes(booking.status) && (
              <button
                onClick={() => handleDelete(booking.id)}
                className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 ml-2"
              >
                ลบคำขอ
              </button>
            )}
              </div>
            )}

           
            
          </div>
        ))}
      </div>
    </>
  );
};

export default BookingList;
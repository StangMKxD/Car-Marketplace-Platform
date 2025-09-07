import type { Usertype } from "../types";
import { removeUser } from "@/api/admin";
import { toast } from "react-toastify";
import { CiCircleRemove } from "react-icons/ci";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const MySwal = withReactContent(Swal);

type UserTableProps = {
  user: Usertype[];
  onDelete: (id: number) => void;
};

const UserTableAdmin = ({ user, onDelete }: UserTableProps) => {
  const handleDelete = async (user: Usertype) => {
    if (user.role === "ADMIN") {
      toast.error("ไม่สามารถลบผู้ดูแลระบบได้");
      return;
    }

    const result = await MySwal.fire({
      title: `ยืนยันการลบผู้ใช้`,
      html: (
        <span>
          ต้องการลบผู้ใช้{" "}
          <b>
            {user.name} {user.surname}
          </b>{" "}
          หรือไม่?
        </span>
      ),
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "ลบเลย",
      cancelButtonText: "ยกเลิก",
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
    });

    if (!result.isConfirmed) return;

    try {
      const res = await removeUser(user.id);
      const deleted = res.deleted?.model;

      if (deleted) {
        toast.success(`ลบ ${deleted} สำเร็จ`);
      } else {
        toast.success("ลบผู้ใช้สำเร็จ");
      }

      onDelete(user.id);
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("ลบผู้ใช้ไม่สำเร็จ");
    }
  };

  return (
    <div className="max-h-[500px] w-[900px] overflow-y-auto shadow hover:shadow-lg rounded-lg bg-white p-4 mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-center">รายการผู้ใช้งาน</h2>
      <table className="w-full border-collapse">
        <thead className="sticky top-0 bg-blue-100 z-10">
          <tr>
            {["ชื่อ", "นามสกุล", "อีเมล", "เบอร์โทร", "สิทธิ์", "การจัดการ"].map(
              (title) => (
                <th
                  key={title}
                  className="border-b-2 border-gray-300 px-4 py-2 text-center text-gray-700 font-semibold"
                >
                  {title}
                </th>
              )
            )}
          </tr>
        </thead>
        <tbody>
          {user.map((u) => (
            <tr
              key={u.id}
              className="hover:bg-gray-50 transition-colors duration-200"
            >
              <td className="border-b border-gray-200 px-4 py-2 text-center">
                {u.name}
              </td>
              <td className="border-b border-gray-200 px-4 py-2 text-center">
                {u.surname}
              </td>
              <td className="border-b border-gray-200 px-4 py-2 text-center">
                {u.email}
              </td>
              <td className="border-b border-gray-200 px-4 py-2 text-center">
                {u.phone}
              </td>
              <td className="border-b border-gray-200 px-4 py-2 text-center">
                {u.role}
              </td>
              <td className="border-b border-gray-200 px-4 py-2 text-center">
                {u.role == "ADMIN" && (
                  <button
                    onClick={() => handleDelete(u)}
                    className="p-2 bg-red-500 rounded text-white hover:bg-red-600 cursor-pointer"
                    title="ลบ"
                  >
                    <CiCircleRemove size={20} />
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserTableAdmin;

import type { Usertype } from "../types";
import { removeUser } from "@/api/car";
import { toast } from "react-toastify";
import { CiCircleRemove } from "react-icons/ci";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const MySwal = withReactContent(Swal);

type userProps = {
  user: Usertype;
  onDelete: (id: number) => void;
};

const UserListAdmin = ({ user, onDelete }: userProps) => {
  const handleDelete = async (id: number) => {
    if (user.role === "ADMIN") {
      toast.error("ไม่สามารถลบผู้ดูแลระบบได้");
      return;
    }

    const result = await MySwal.fire({
      title: `ยืนยันการลบผู้ใช้`,
      html: (
        <span>
          ต้องการลบผู้ใช้ <b>{user.name} {user.surname}</b> หรือไม่?
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
      const res = await removeUser(id);
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
    <div className="flex border p-2 rounded shadow mt-2">
      <div className="flex-1">
        <p><b>Name:</b> {user.name}</p>
        <p><b>Surname:</b> {user.surname}</p>
        <p><b>Email:</b> {user.email}</p>
        <p><b>Phone:</b> {user.phone}</p>
        <p><b>Role:</b> {user.role}</p>
      </div>
      <div>
        {user.role !== "admin" && (
          <button
            onClick={() => handleDelete(user.id)}
            className="p-2 bg-red-500 rounded text-white hover:bg-red-600 cursor-pointer"
            title="ลบ"
          >
            <CiCircleRemove size={20} />
          </button>
        )}
      </div>
    </div>
  );
};

export default UserListAdmin;

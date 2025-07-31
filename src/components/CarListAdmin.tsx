import type { Cartype } from "../types";
import { useState } from "react";
import { removeData, updateData } from "../api/admin";
import { toast } from "react-toastify";
import { FaRegEdit } from "react-icons/fa";
import { CiCircleRemove } from "react-icons/ci";
import { MdDone, MdClose } from "react-icons/md";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const MySwal = withReactContent(Swal);

type ListProps = {
  item: Cartype;
  loadData: () => void;
};

const ListAdmin = ({ item, loadData }: ListProps) => {
  const [isEdit, setIsEdit] = useState(false);
  const [formEdit, setFormEdit] = useState<Cartype>({ ...item });

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
      [name]:
        name === "price" || name === "year" || name === "mileage"
          ? Number(value)
          : value,
    }));
  };

  // delete function
  const handleDelete = async (id: number) => {
    const result = await MySwal.fire({
      title: "ยืนยันการลบรถยนต์",
      html: (
        <span>
          คุณต้องการลบรถ{" "}
          <b>
            {item.brand} {item.model}
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
      const res = await removeData(id);

      if (res.deleted && res.deleted.model) {
        toast.success(`ลบ ${res.deleted.model} สำเร็จ`);
      } else {
        toast.success("ลบรถสำเร็จ");
      }

      loadData();
    } catch (error) {
      console.error("Error deleting car:", error);
      toast.error("ลบรถไม่สำเร็จ");
    }
  };

  const handleConfirm = async (id: number) => {
    try {
      const res = await updateData(id, formEdit);
      toast.success(`แก้ไขรถ ${formEdit.model} สำเร็จ`);
      setIsEdit(false);
      loadData();
    } catch (error) {
      console.error("Error updating car:", error);
      toast.error("แก้ไขไม่สำเร็จ");
    }
  };

  return (
    <>
      <div className="flex overflow-hidden">
        <div className="flex-1 mx-2 my-2 bg-white h-auto rounded-xl p-4 shadow w-full border border-[#dbdbdb]">
          <div className="flex justify-center my-4 gap-3">
            {isEdit ? (
              <>
                <button
                  onClick={() => handleConfirm(item.id)}
                  className="flex items-center gap-1 px-4 py-2 rounded bg-green-500 text-white hover:bg-green-600"
                  title="บันทึก"
                >
                  <MdDone size={20} />
                  บันทึก
                </button>
                <button
                  onClick={handleCancel}
                  className="flex items-center gap-1 px-4 py-2 rounded bg-gray-500 text-white hover:bg-gray-600"
                  title="ยกเลิก"
                >
                  <MdClose size={20} />
                  ยกเลิก
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleEdit}
                  className="flex items-center gap-1 px-4 py-2 rounded bg-yellow-500 text-white hover:bg-yellow-600"
                  title="แก้ไข"
                >
                  <FaRegEdit size={20} />
                  แก้ไข
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="flex items-center gap-1 px-4 py-2 rounded bg-red-500 text-white hover:bg-red-600"
                  title="ลบ"
                >
                  <CiCircleRemove size={25} />
                  ลบ
                </button>
              </>
            )}
          </div>
          {/* รูปภาพ */}
          <div className="w-full p-1 h-auto flex-shrink-0 overflow-hidden rounded-lg border mx-auto border-gray-300">
            {item.imageUrl ? (
              <img
                src={item.imageUrl}
                alt={item.model}
                className="object-cover w-full h-full"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400 italic text-sm">
                โหลดบ่ติด
              </div>
            )}
          </div>

          {/* ข้อมูลรถ */}
          <div
            className={
              isEdit
                ? "flex flex-col space-y-2 p-4 rounded-3xl"
                : "flex w-full justify-center space-x-4"
            }
          >
            <div className="my-1 p-1 bg-amber-100 rounded-3xl">
              {isEdit ? (
                <input
                  type="text"
                  name="brand"
                  value={formEdit.brand}
                  onChange={handleChange}
                  className="border p-1 rounded w-full"
                />
              ) : (
                item.brand
              )}
            </div>

            <div className="my-1 p-1 bg-amber-100 rounded-3xl">
              {isEdit ? (
                <input
                  type="text"
                  name="model"
                  value={formEdit.model}
                  onChange={handleChange}
                  className="border p-1 rounded w-full"
                />
              ) : (
                item.model
              )}
            </div>

            <div className="my-1 p-1 bg-amber-100 rounded-3xl">
              {isEdit ? (
                <input
                  type="number"
                  name="price"
                  value={formEdit.price}
                  onChange={handleChange}
                  className="border p-1 rounded w-full"
                />
              ) : (
                item.price.toLocaleString()
              )}
            </div>

            <div className="my-1 p-1 bg-amber-100 rounded-3xl">
              {isEdit ? (
                <input
                  type="text"
                  name="type"
                  value={formEdit.type}
                  onChange={handleChange}
                  className="border p-1 rounded w-full"
                />
              ) : (
                item.type
              )}
            </div>

            <div className="my-1 p-1 bg-amber-100 rounded-3xl">
              {isEdit ? (
                <input
                  type="text"
                  name="fuel"
                  value={formEdit.fuel}
                  onChange={handleChange}
                  className="border p-1 rounded w-full"
                />
              ) : (
                item.fuel
              )}
            </div>
          </div>

          <div>
            {isEdit ? (
              <textarea
                name="detail"
                value={formEdit.detail}
                onChange={handleChange}
                className="border px-2 py-1 rounded w-full resize-y min-h-[100px]"
              />
            ) : (
              <p className="whitespace-pre-wrap break-words my-2">
                {item.detail}
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ListAdmin;

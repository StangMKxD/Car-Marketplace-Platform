"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useCompare } from "@/contexts/CompareContext";
import { logout } from "@/utils/logout";

const Navbar = () => {
  const router = useRouter();
  const { isLoggedIn, setIsLoggedIn, role, setRole } = useAuth();
  const { count } = useCompare();

  const handleLogout = () => {
   logout()
    setIsLoggedIn(false);
    setRole(null); 
    router.push("/login");
  };


  return (
    <nav className="fixed top-0 left-0 w-full flex justify-between items-center p-4 bg-gray-100 shadow-md z-50">
  <div className="flex space-x-5">
    <Link href="/">
      <span className="text-[18px] cursor-pointer hover:text-blue-600">
        หน้าแรก
      </span>
    </Link>
    <Link href="/car">
      <span className="text-[18px] cursor-pointer hover:text-blue-600">
        ดูรถยนต์
      </span>
    </Link>
    <Link href="/contact">
      <span className="text-[18px] cursor-pointer hover:text-blue-600">
        ติดต่อเรา
      </span>
    </Link>

    <div className="relative mr-10">
    {isLoggedIn ? (

      <Link
        href="/compare"
        className="text-[18px] cursor-pointer hover:text-blue-600"
        >
        <span>เปรียบเทียบ</span>
        <span className="absolute bottom-0 text-white text-xs py-1 px-2 bg-blue-500/80 rounded-full ">{count}</span>
      </Link>
    ) : (
      ""
    )}
        </div>

    {role === "ADMIN" && (
      <Link href="/admin">
        <span className="text-[18px] cursor-pointer hover:text-blue-600">
          จัดการหลังบ้าน
        </span>
      </Link>
    )}
  </div>

  <div className="flex gap-4">
    {isLoggedIn ? (
      <>
        <Link href="/profile">
          <span className="cursor-pointer hover:text-blue-600">ดูโปรไฟล์</span>
        </Link>
        <button
          onClick={handleLogout}
          className="text-red-500 cursor-pointer hover:underline"
        >
          ออกจากระบบ
        </button>
      </>
    ) : (
      <>
        <Link href="/login">
          <span className="cursor-pointer hover:text-blue-600">เข้าสู่ระบบ</span>
        </Link>
        <Link href="/register">
          <span className="cursor-pointer hover:text-blue-600">สมัครสมาชิก</span>
        </Link>
      </>
    )}
  </div>
</nav>
  );
};

export default Navbar;
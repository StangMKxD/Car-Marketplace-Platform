import { FaPhoneVolume, FaFacebook } from "react-icons/fa";
import Image from "next/image";

const ContactPage = () => {
  return (
    <>
      <div className="flex pt-20 w-full justify-center h-[700px] bg-blue-200 ">
        <div className="p-2">
          <h1 className="text-center text-2xl">โซเชียลมีเดีย</h1>
          <div className="flex justify-center space-x-4 py-4">

            <div className="relative group ">
              <a
                href="https://www.facebook.com/share/177T9WvXGQ/?mibextid=wwXIfr"
                target="blank"
                className="text-[#1877F2] text-2xl cursor-pointer"
              >
                <FaFacebook />
              </a>
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition bg-white text-black text-sm rounded px-2 py-1 shadow z-10 whitespace-nowrap">
                ติดต่อเรา
              </div>
            </div>

            <div className="relative group ">
              <a
                href="tel:0817072534"
                target="blank"
                className="text-[#18f24b] text-2xl cursor-pointer"
              >
                <FaPhoneVolume />
              </a>
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition bg-white text-black text-sm rounded px-2 py-1 shadow z-10 whitespace-nowrap">
                โทรเลย
              </div>
            </div>

            <div className="relative group ">
              <a
                href="https://mail.google.com/mail/?view=cm&fs=1&to=Caiyo99money@gmail.com&su=สอบถามข้อมูล"
                target="blank"
                className="cursor-pointer"
              >
                <img src="/gmail.png" alt="Gmail" width={24} height={21} />
              </a>
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition bg-white text-black text-sm rounded px-2 py-1 shadow z-10 whitespace-nowrap">
                ส่งอีเมล
              </div>
            </div>
          </div>
          <div className="grid grid-cols-3 space-x-2 h-[400px] w-full  text-center mt-4">
            <div className="bg-amber-200 w-[150px]">
              <h1>ที่อยู่</h1>
            <div className="p-2">
              <p>630 4 <br></br>ตำบลบางระกำ อำเภอบางระกำ พิษณุโลก 65140</p>
            </div>
            </div>
            <div className="bg-amber-200 w-[150px]">
              <h1>เวลาทำการ</h1>
            <div className="p-2">
              <p>เปิดทุกวัน <br></br>9.00 น. - 17.00 น.</p>
            </div>
            </div>
            <div className="bg-amber-200 w-[150px]">
              <h1>ข้อเสนอแนะ</h1>
              </div>
          </div>
        </div>
        <div className="m-4">
          <div className="w-[500px] h-full bg-amber-600 p-4">Map</div>
        </div>
      </div>
    </>
  );
};
export default ContactPage;

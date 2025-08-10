const prisma = require('../prisma/prisma');
const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

// ดูlist user
exports.userList = async (req, res) => {
    try {
        const user = await prisma.user.findMany({
            orderBy: { createdAt: 'desc' }
        });
        res.json({ user })
    } catch (err) {
        console.error("userlist",err)
        res.status(500).json({ message: "โหลดผู้ใช้ไม่สำเร็จ"})
    }
}

// ลบผู้ใช้ 
exports.deleteUser = async (req, res) => {
  const userId = parseInt(req.params.id);

  try {
    // ลบข้อมูล favorite cars ของ user นี้
    await prisma.favouriteCar.deleteMany({
      where: { userId },
    });

    // ลบข้อมูล booking ของ user นี้ (ถ้ามี)
    await prisma.booking.deleteMany({
      where: { userId },
    });

    const deleted = await prisma.user.delete({
      where: { id: userId },
    });

    res.json({ deleted });
  } catch (err) {
    console.error("deleteuser",err);
    if (err.code === 'P2003') {
      return res.status(400).json({ message: "ไม่สามารถลบผู้ใช้ได้ เนื่องจากข้อมูลที่เกี่ยวข้องยังมีอยู่" });
    }
    res.status(500).json({ message: "ลบผู้ใช้ล้มเหลว" });
  }
};

// เพิ่มรถ
exports.createCar = async (req, res) => {
  const { brand, model, year, fuel, price, transmission, detail, type } = req.body;
  const files = req.files; 

  if (!brand) return res.status(400).json({ message: "กรุณากรอกยี่ห้อรถ (brand)" });
  if (!year || isNaN(parseInt(year))) return res.status(400).json({ message: "กรุณากรอกปีรถให้ถูกต้อง" });
  if (!price || isNaN(parseInt(price))) return res.status(400).json({ message: "กรุณากรอกราคารถให้ถูกต้อง" });

  try {
    const newCar = await prisma.car.create({
      data: {
        brand,
        model,
        year: parseInt(year),
        fuel,
        price: parseInt(price),
        transmission,
        detail,
        type,
        images: {
          create: files.map((file) => ({
            url: `/uploads/${file.filename}`,
          })),
        },
      },
      include: {
        images: true,
      },
    });

    res.status(201).json({ message: "สร้างรถสำเร็จ", car: newCar });
  } catch (err) {
    console.error("cretecar", err);
    res.status(500).json({ message: "สร้างรถไม่สำเร็จ" });
  }
};

// แก้ไขรถ
exports.updateCar = async (req, res) => {
  const id = Number(req.params.id);
  const { brand, model, year, fuel, price, transmission, imageUrl, detail, type } =
    req.body;

  try {
    const car = await prisma.car.update({
      where: { id },
      data: { brand, model, year, fuel, price, transmission, imageUrl, detail, type },
    });
    res.json(car);
  } catch (err) {
    console.error("updatecar", err)
    res.status(404).json({ message: "ไม่เจอรถที่จะแก้ไข" });
  }
};

// ลบรถ
exports.deleteCar = async (req, res) => {
  const id = Number(req.params.id);
  try {
    const car = await prisma.car.findUnique({
      where: { id },
    });

    if (!car) {
      return res.status(404).json({ message: "ไม่เจอรถที่จะลบ" });
    }

    // ลบข้อมูลที่ FK ไปยังรถก่อน เช่น รูปภาพ
    await prisma.image.deleteMany({
      where: { carId: id },
    });

    // ลบ favouriteCars
    await prisma.favouriteCar.deleteMany({
      where: { carId: id },
    });

    // ลบ bookings
    await prisma.booking.deleteMany({
      where: { carId: id },
    });

    // ลบ compareCars ทั้งที่เป็น carA หรือ carB
    await prisma.compareCar.deleteMany({
      where: {
        OR: [{ carAId: id }, { carBId: id }],
      },
    });

    // ลบรถ
    await prisma.car.delete({
      where: { id },
    });

    res.json({ message: "ลบรถสำเร็จ", deleted: car });
  } catch (err) {
    console.error("deletecar",err);
    res.status(500).json({ message: "เกิดข้อผิดพลาดขณะลบรถ", error: error.message });
  }
};

// ดึงรถทั้งหมด (สำหรับ admin กับ user)
exports.getAllCars = async (req, res) => {
  try {
    const cars = await prisma.car.findMany({
      include: {
        images: true
      }
    });
    res.json(cars);
  } catch (err) {
    console.error("getallcars", err)
    res.status(500).json({ message: "Fetch ข้อมูลรถล้มเหลว" });
  }
};

// ดึงรถเฉพาะ ไอดี
exports.getCar = async (req, res) => {
  const carId = Number(req.params.id);

  try {
    const car = await prisma.car.findUnique({
      where: { id: carId },
      include: {
        images: true, 
      },
    });

    if (!car) {
      return res.status(404).json({ message: "ไม่พบรถยนต์คันนี้" });
    }

    res.json(car);
  } catch (err) {
    console.error("getcar", err);
    res.status(500).json({ message: "เกิดข้อผิดพลาด" });
  }
};

// ดู ข้อมูลการจองทดลองขับ
exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await prisma.booking.findMany({
      where: { status: "PENDING" },
      include: {
        user: true,
        car: true,
      },
    });
    res.json(bookings);
  } catch (err) {
    console.error("getallbookings",err);
    res.status(500).json({ message: "ดึงข้อมูลไม่สำเร็จ" });
  }
};

// อัปเดทสถานะ ส่งเมลด้วย
exports.updateBookingStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const booking = await prisma.booking.findUnique({
      where: { id: parseInt(id) },
      include: {
        user: true,
        car: true,
      },
    });

    if (!booking) {
      return res.status(404).json({ message: "ไม่พบการจองนี้" });
    }

    // ถ้าเคยส่งแล้ว ไม่ต้องส่งอีก
    if (booking.emailSent) {
      return res.json({ message: "อีเมลนี้ส่งไปแล้ว", booking });
    }

    // อัปเดตสถานะ
    const updated = await prisma.booking.update({
      where: { id: parseInt(id) },
      data: { status },
      include: {
        user: true,
        car: true,
      },
    });

    const { user, car } = updated;

    const statusText = status === "APPROVED" ? "ได้รับการอนุมัติแล้ว" : "ไม่ได้รับการอนุมัติ";
    const emailContent = `
เรียนคุณ ${user.name} ${user.surname},

การจองรถของคุณสำหรับรถรุ่น "${car.brand} ${car.model} ${car.year}" ${statusText}
หากคุณมีคำถามหรือต้องการข้อมูลเพิ่มเติม กรุณาติดต่อเราได้ทุกเมื่อ

ขอแสดงความนับถือ,
คนหล่อคนเท่
`;

console.log("📤 กำลังส่งอีเมลไปที่:", user.email);

    // ส่งอีเมลด้วย Resend
    await resend.emails.send({
      from: process.env.EMAIL_FROM,
      to: user.email,
      subject: "แจ้งสถานะการจองรถของคุณ",
      text: emailContent || "นี่คือข้อความทดสอบส่งอีเมลจาก localhost",
    });

    console.log("✅ ส่งอีเมลสำเร็จแล้ว");

    await prisma.booking.update({
      where: { id: parseInt(id) },
      data: { emailSent: true },
    });

    res.json(updated);
  } catch (err) {
    console.error("updateBookingStatus error:", err);
    res.status(500).json({ message: "อัปเดตสถานะไม่สำเร็จ" });
  }
};


// ใช้ AI ส่ง หลังจากสถานะ Approved
// exports.updateBookingStatus = async (req, res) => {
//   const { id } = req.params;
//   const { status } = req.body;

//   try {
//     const updated = await prisma.booking.update({
//       where: { id: parseInt(id) },
//       include: {
//         user: true,
//         car: true,
//       },
//       data: { status },
//     });

//     // ดึงข้อมูลผู้ใช้และรถ
//     const { user, car } = updated;

//     // ใช้ ChatGPT สร้างข้อความ
//     const chatResponse = await openai.chat.completions.create({
//       model: "gpt-4o",
//       messages: [
//         {
//           role: "system",
//           content: "คุณคือผู้ช่วยสำหรับส่งอีเมลแจ้งสถานะการจองรถให้ลูกค้า",
//         },
//         {
//           role: "user",
//           content: `ช่วยเขียนอีเมลแจ้งลูกค้า ${user.name} ว่าการจองรถ ${car.name} สถานะ: ${status === "APPROVED" ? "อนุมัติแล้ว" : "ถูกปฏิเสธ"}`,
//         },
//       ],
//     });

//     const emailContent = chatResponse.choices[0].message.content;

//     // ส่งอีเมลด้วย Nodemailer
//     const transporter = nodemailer.createTransport({
//       service: "gmail",
//       auth: {
//         user: process.env.EMAIL_USER,
//         pass: process.env.EMAIL_PASS,
//       },
//     });

//     await transporter.sendMail({
//       from: process.env.EMAIL_USER,
//       to: user.email,
//       subject: "แจ้งสถานะการจองรถของคุณ",
//       text: emailContent,
//     });

//     res.json(updated);
//   } catch (err) {
//     console.error("updatebookingstatus", err);
//     res.status(500).json({ message: "อัปเดตสถานะไม่สำเร็จ" });
//   }
// };
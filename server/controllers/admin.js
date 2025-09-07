const prisma = require("../prisma/prisma");
const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

// ดูlist user
exports.userList = async (req, res) => {
  try {
    const user = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
    });
    res.json({ user });
  } catch (err) {
    console.error("userlist", err);
    res.status(500).json({ message: "โหลดผู้ใช้ไม่สำเร็จ" });
  }
};

// ลบผู้ใช้
exports.deleteUser = async (req, res) => {
  const userId = parseInt(req.params.id);

  try {
    await prisma.favouriteCar.deleteMany({
      where: { userId },
    });

    await prisma.booking.deleteMany({
      where: { userId },
    });

    await prisma.compareCar.deleteMany({
      where: { userId: parseInt(userId) },
    });

    const deleted = await prisma.user.delete({
      where: { id: userId },
    });

    res.json({ deleted });
  } catch (err) {
    console.error("deleteuser", err);
    if (err.code === "P2003") {
      return res.status(400).json({
        message: "ไม่สามารถลบผู้ใช้ได้ เนื่องจากข้อมูลที่เกี่ยวข้องยังมีอยู่",
      });
    }
    res.status(500).json({ message: "ลบผู้ใช้ล้มเหลว" });
  }
};

// เพิ่มรถ
exports.createCar = async (req, res) => {
  const { brand, model, year, fuel, price, transmission, detail, type } =
    req.body;
  const files = req.files;

  if (!brand)
    return res.status(400).json({ message: "กรุณากรอกยี่ห้อรถ (brand)" });
  if (!year || isNaN(parseInt(year)))
    return res.status(400).json({ message: "กรุณากรอกปีรถให้ถูกต้อง" });
  if (!price || isNaN(parseInt(price)))
    return res.status(400).json({ message: "กรุณากรอกราคารถให้ถูกต้อง" });

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
  const {
    brand,
    model,
    year,
    fuel,
    price,
    transmission,
    imageUrl,
    detail,
    type,
  } = req.body;

  const typeMap = {
    รถเก๋ง: "SEDAN",
    กระบะ: "PICKUP",
    กระบะ4ประตู: "PICKUP4",
    รถ7ที่นั่ง: "MPV",
  };

  const enumType = typeMap[type];

  if (!enumType) {
    return res.status(400).json({ message: "ประเภทรถไม่ถูกต้อง" });
  }

  try {
    const car = await prisma.car.update({
      where: { id },
      data: {
        brand,
        model,
        year: parseInt(year),
        fuel,
        price: parseInt(price),
        transmission,
        imageUrl,
        detail,
        type: enumType,
      },
    });
    res.json(car);
  } catch (err) {
    console.error("updatecar", err);
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

    await prisma.image.deleteMany({
      where: { carId: id },
    });

    await prisma.favouriteCar.deleteMany({
      where: { carId: id },
    });

    await prisma.booking.deleteMany({
      where: { carId: id },
    });

    await prisma.compareCar.deleteMany({
      where: {
        OR: [{ carAId: id }, { carBId: id }],
      },
    });

    await prisma.car.delete({
      where: { id },
    });

    res.json({ message: "ลบรถสำเร็จ", deleted: car });
  } catch (err) {
    console.error("deletecar", err);
    res
      .status(500)
      .json({ message: "เกิดข้อผิดพลาดขณะลบรถ", error: error.message });
  }
};

//ปุ่มขายแล้ว
exports.sellCar = async (req, res) => {
  const { carId } = req.body;

  try {
    const car = await prisma.car.findUnique({ where: { id: carId } });
    if (!car) return res.status(404).json({ message: "ไม่พบรถ" });

    await prisma.$transaction(async (tx) => {
      await tx.favouriteCar.deleteMany({ where: { carId } });
      await tx.compareCar.deleteMany({
        where: { OR: [{ carAId: carId }, { carBId: carId }] },
      });
      await tx.booking.deleteMany({ where: { carId } });
      await tx.image.deleteMany({ where: { carId } });

      await tx.soldCar.create({
        data: {
          carId: car.id,
          brand: car.brand,
          model: car.model,
          year: car.year,
          fuel: car.fuel,
          price: car.price,
          transmission: car.transmission,
          detail: car.detail,
          type: car.type,
        },
      });

      await tx.car.delete({ where: { id: carId } });
    });

    res.status(200).json({ message: "ขายรถสำเร็จ" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "เกิดข้อผิดพลาดในการขายรถ" });
  }
};

// ดึงรถทั้งหมด (สำหรับ admin กับ user)
exports.getAllCars = async (req, res) => {
  try {
    const typeTH = {
      SEDAN: "รถเก๋ง",
      PICKUP4: "กระบะ4ประตู",
      PICKUP: "กระบะ",
      MPV: "รถ7ที่นั่ง",
    };

    const cars = await prisma.car.findMany({
      include: {
        images: true,
      },
    });

    const carsWithThaiType = cars.map((car) => ({
      ...car,
      type: typeTH[car.type] || car.type,
    }));
    res.json(carsWithThaiType);
  } catch (err) {
    console.error("getallcars", err);
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
    console.error("getallbookings", err);
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

    const statusText =
      status === "APPROVED" ? "ได้รับการอนุมัติแล้ว" : "ไม่ได้รับการอนุมัติ";
    const emailContent = `
เรียนคุณ ${user.name} ${user.surname},

การจองรถของคุณสำหรับรถรุ่น "${car.brand} ${car.model} ${car.year}" ${statusText}
หากคุณมีคำถามหรือต้องการข้อมูลเพิ่มเติม กรุณาติดต่อเราได้ทุกเมื่อ

ขอแสดงความนับถือ,
คนหล่อคนเท่
`;

    console.log(" กำลังส่งอีเมลไปที่:", user.email);

    // ส่งอีเมลด้วย Resend
    await resend.emails.send({
      from: process.env.EMAIL_FROM,
      to: user.email,
      subject: "แจ้งสถานะการจองรถของคุณ",
      text: emailContent || "นี่คือข้อความทดสอบส่งอีเมลจาก localhost",
    });

    console.log("ส่งอีเมลสำเร็จแล้ว");

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

// แดชบอร์ดแสดงข้อมูล
exports.getAdminDashboards = async (req, res) => {
  try {

    const totalUsers = await prisma.user.count();
    const totalCars = await prisma.car.count();
    const totalCarSoldCount = await prisma.soldCar.count();
    const [{ _sum: carSum }, { _sum: soldSum }] = await Promise.all([
      prisma.car.aggregate({ _sum: { price: true } }),
      prisma.soldCar.aggregate({ _sum: { price: true } }),
    ]);
    const totalPrice = carSum.price || 0;
    const totalSold = soldSum.price || 0;

    const [approvedCount, rejectedCount, totalBookingsCars] = await Promise.all([
      prisma.booking.count({ where: { status: "APPROVED" } }),
      prisma.booking.count({ where: { status: "REJECTED" } }),
      prisma.booking.count({ where: { status: "PENDING" } }),
    ]);


    const carTypeMapping = {
      SEDAN: "รถเก๋ง",
      PICKUP4: "รถกระบะ 4 ประตู",
      PICKUP: "รถกระบะ",
      MPV: "รถ 7 ที่นั่ง",
    };

    const transmissionMapping = {
      AUTO: "อัตโนมัติ",
      MANUAL: "ธรรมดา",
    };


    const totalCarTypeRaw = await prisma.car.groupBy({
      by: ["type"],
      _count: { type: true },
    });
    const carTypeData = totalCarTypeRaw.map((item) => ({
      name: carTypeMapping[item.type] || item.type || "อื่น ๆ",
      จำนวนรถ: item._count.type,
    }));

 
    const [cars, soldCars, users, bookings] = await Promise.all([
      prisma.car.findMany({ select: { createdAt: true, price: true } }),
      prisma.soldCar.findMany({ select: { soldAt: true, price: true } }),
      prisma.user.findMany({ select: { createdAt: true } }),
      prisma.booking.findMany({ select: { createdAt: true } }),
    ]);

    const months = [
      "ม.ค.","ก.พ.","มี.ค.","เม.ย.","พ.ค.","มิ.ย.",
      "ก.ค.","ส.ค.","ก.ย.","ต.ค.","พ.ย.","ธ.ค."
    ];

    const monthyStatsUser = Array(12).fill(0);
    const monthyStatsCarsIn = Array(12).fill(0);
    const monthyStatsCarsOut = Array(12).fill(0);
    const monthyPriceCarsIn = Array(12).fill(0);
    const monthyPriceCarsOut = Array(12).fill(0);
    const monthyStatsBooking = Array(12).fill(0);

    cars.forEach((c) => {
      const month = new Date(c.createdAt).getMonth();
      monthyStatsCarsIn[month] += 1;
      monthyPriceCarsIn[month] += Number(c.price) || 0;
    });

    soldCars.forEach((s) => {
      const month = new Date(s.soldAt).getMonth();
      monthyStatsCarsOut[month] += 1;
      monthyPriceCarsOut[month] += Number(s.price) || 0;
    });

    users.forEach((u) => {
      const month = new Date(u.createdAt).getMonth();
      monthyStatsUser[month] += 1;
    });

    bookings.forEach((b) => {
      const month = new Date(b.createdAt).getMonth();
      monthyStatsBooking[month] += 1;
    });


    const monthyCars = months.map((name, index) => ({
      name,
      carsIn: monthyStatsCarsIn[index],
      carsInPrice: monthyPriceCarsIn[index],
      carsOut: monthyStatsCarsOut[index],
      carsOutPrice: monthyPriceCarsOut[index],
    }));

    const monthyStats = months.map((name, index) => ({
      name,
      users: monthyStatsUser[index],
      bookings: monthyStatsBooking[index],
    }));

    
    const popularCarsRaw = await prisma.car.findMany({
      orderBy: [{ totalBookings: "desc" }, { totalFavorites: "desc" }],
      select: {
        id: true,
        brand: true,
        model: true,
        year: true,
        fuel: true,
        type: true,
        transmission: true,
        price: true,
        totalBookings: true,
        totalFavorites: true,
      },
    });

    const popularCars = popularCarsRaw
      .filter((car) => (car.totalBookings || 0) > 0 || (car.totalFavorites || 0) > 0)
      .map((car) => ({
        ...car,
        type: carTypeMapping[car.type] || car.type,
        transmission: transmissionMapping[car.transmission] || car.transmission,
      }));

    res.json({
      totalUsers,
      totalBookingsCars,
      totalCars,
      totalCarSoldCount,
      totalSold,
      totalPrice,
      approvedCount,
      rejectedCount,
      carTypeData,
      monthyCars,
      monthyStats,
      popularCars,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "เกิดข้อผิดพลาดในการดึงข้อมูล" });
  }
};


// stock of car by type
exports.carStockStatus = async (req, res) => {
  try {
    const stockData = await prisma.car.groupBy({
      by: ["type"],
      _sum: { stock: true },
    });

    const thresholds = {
      SEDAN: { min: 7, max: 12 },
      PICKUP4: { min: 3, max: 8 },
      PICKUP: { min: 3, max: 7 },
      MPV: { min: 2, max: 5 },
    };

    const alerts = stockData.map((item) => {
      const stockCount = item._sum.stock || 0;
      const { min, max } = thresholds[item.type] || { min: 0, max: 15 };
      let status = "ok";
      if (stockCount < min) status = "low";
      if (stockCount > max) status = "high";
      return {
        type: item.type,
        stock: stockCount,
        status,
        min,
        max,
      };
    });

    res.json(alerts);
  } catch (err) {
    console.error("carStockStatus", err);
    res.status(500).json({ message: "โหลด stock ไม่สำเร็จ" });
  }
};

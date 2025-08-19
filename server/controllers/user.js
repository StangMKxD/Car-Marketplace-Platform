const prisma = require("../prisma/prisma");
const cron = require("node-cron");
const jwt = require("jsonwebtoken");
const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

// แก้ไข profile ของตัวเอง
exports.updateProfile = async (req, res) => {
  const userId = req.user.id;
  const { name, surname, email, password, phone } = req.body;

  const updateData = {};
  if (name) updateData.name = name;
  if (surname) updateData.surname = surname;
  if (email) updateData.email = email;
  if (password) updateData.password = password;
  if (phone) updateData.phone = phone;

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: updateData,
    select: { id: true, name: true, surname: true, email: true, phone: true },
  });

  res.json(updatedUser);
};

// จองรถทดลองขับ
exports.createBooking = async (req, res) => {
  const { carId, date } = req.body;
  const userId = req.user.id;
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
  });

  if (!user.emailVerified) {
    return res.status(403).json({ message: "กรุณายืนยันอีเมลก่อนทำการจอง" });
  }

  try {
    const newBooking = await prisma.booking.create({
      data: {
        carId,
        date: new Date(date),
        userId,
        status: "PENDING",
      },
    });
    await prisma.car.update({
      where: { id: carId },
      data: {
        totalBookings: {
          increment: 1,
        },
      },
    });

    res.json(newBooking);
  } catch (err) {
    console.error("booking error", err);
    res.status(500).json({ message: "จองไม่สำเร็จ" });
  }
};

// ดูรายการจอง
exports.getBooking = async (req, res) => {
  const userId = req.user.id;

  try {
    const bookingList = await prisma.booking.findMany({
      where: { userId },
      include: {
        car: true,
        user: true,
      },
    });

    const result = bookingList.map((booking) => ({
      id: booking.id,
      date: booking.date,
      status: booking.status,
      car: booking.car,
      user: {
        name: booking.user.name,
        surname: booking.user.surname,
      },
    }));

    res.json(result);
  } catch (err) {
    console.error("Fetch Booking error:", err);
    res.status(500).json({ message: "เกิดข้อผิดพลาด" });
  }
};

// ลบรายการจอง
exports.removeBooking = async (req, res) => {
  const userId = req.user.id;
  const bookingId = parseInt(req.params.id);

  try {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking || booking.userId !== userId) {
      return res.status(403).json({ message: "ไม่มีสิทธิ์ลบรายการนี้" });
    }

    if (!["PENDING", "REJECTED"].includes(booking.status)) {
      return res
        .status(400)
        .json({ message: "ไม่สามารถลบรายการที่อนุมัติแล้วได้" });
    }

    await prisma.booking.delete({
      where: { id: bookingId },
    });
    await prisma.car.update({
      where: { id: carId },
      data: {
        totalBookings: {
          decrement: 1,
        },
      },
    });

    res.json({ message: "ลบคำขอจองเรียบร้อยแล้ว" });
  } catch (err) {
    console.error("removebooking", err);
    res.status(500).json({ message: "เกิดข้อผิดพลาดในการลบ" });
  }
};

// เพิ่มรถโปรด
exports.addFavoriteCar = async (req, res) => {
  const userId = req.user.id;
  const { carId } = req.body;

  if (!carId) {
    return res.status(400).json({ message: "carId จำเป็น" });
  }

  try {
    const existing = await prisma.favouriteCar.findFirst({
      where: { userId, carId },
    });
    if (existing)
      return res.status(400).json({ message: "เพิ่มในรายการโปรดคุณแล้ว" });

    const favourite = await prisma.favouriteCar.create({
      data: { userId, carId },
    });
    await prisma.car.update({
      where: { id: carId },
      data: {
        totalFavorites: {
          increment: 1,
        },
      },
    });
    res.json(favourite);
  } catch (err) {
    console.error("add favorite car", err);
    res.status(500).json({ message: "เพิ่มล้มเหลว" });
  }
};

// ลบ favorite car
exports.removeFavoriteCar = async (req, res) => {
  const userId = req.user.id;
  const carId = parseInt(req.params.carId, 10);

  if (!carId) {
    return res.status(400).json({ message: "carId จำเป็น" });
  }

  try {
    await prisma.favouriteCar.deleteMany({
      where: { userId, carId },
    });

    await prisma.car.update({
      where: { id: carId },
      data: {
        totalFavorites: {
          decrement: 1,
        },
      },
    });

    res.json({ message: "ลบรายการโปรดสำเร็จ" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "ลบรายการโปรดล้มเหลว" });
  }
};

// ดู favoritecar
exports.getFavoriteCar = async (req, res) => {
  const userId = req.user.id;
  try {
    const favorites = await prisma.favouriteCar.findMany({
      where: { userId },
      include: {
        car: true,
      },
    });
    res.json(favorites.map((fav) => fav.car));
  } catch (err) {
    console.error("get favorite error:", err);
    res.status(500).json({ message: "เกิดข้อผิดพลาด" });
  }
};

// ดูโปรไฟล์ตัวเอง
exports.getProfile = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        surname: true,
        phone: true,
        email: true,
        role: true,
        emailVerified: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: "ไม่พบผู้ใช้" });
    }

    res.json({
      message: "โหลดข้อมูลโปรไฟล์สำเร็จ",
      user: user,
    });
  } catch (err) {
    console.error("profile error", err);
    res.status(500).json({ message: "เกิดข้อผิดพลาด" });
  }
};

exports.getCompare = async (req, res) => {
  const userId = req.user.id;

  const compare = await prisma.compareCar.findUnique({
    where: { userId },
    include: {
      carA: {
        include: {
          images: true,
        },
      },
      carB: {
        include: {
          images: true,
        },
      },
    },
  });

  res.json(compare || { carA: null, carB: null });
};

// เพิ่มหรือ toggle คันรถ
exports.toggleCompare = async (req, res) => {
  const userId = req.user.id;
  const { carId } = req.body;

  let compare = await prisma.compareCar.findUnique({ where: { userId } });

  if (!compare) {
    compare = await prisma.compareCar.create({
      data: { userId, carAId: carId },
    });

    const newCompare = await prisma.compareCar.findUnique({
      where: { userId },
      include: {
        carA: { include: { images: true } },
        carB: { include: { images: true } },
      },
    });
    return res.json(newCompare);
  }

  if (compare.carAId === carId) {
    await prisma.compareCar.update({
      where: { userId },
      data: { carAId: null },
    });
  } else if (compare.carBId === carId) {
    await prisma.compareCar.update({
      where: { userId },
      data: { carBId: null },
    });
  } else if (!compare.carAId) {
    await prisma.compareCar.update({
      where: { userId },
      data: { carAId: carId },
    });
  } else if (!compare.carBId) {
    await prisma.compareCar.update({
      where: { userId },
      data: { carBId: carId },
    });
  } else {
    return res
      .status(400)
      .json({ message: "สามารถเปรียบเทียบได้สูงสุด 2 คัน" });
  }

  const updated = await prisma.compareCar.findUnique({
    where: { userId },
    include: {
      carA: { include: { images: true } },
      carB: { include: { images: true } },
    },
  });

  res.json(updated);
};

//ลบรายการของรถ
exports.startBookingCleanupJob = () => {
  // รันทุกวันตอนเที่ยงคืน
  cron.schedule("0 0 * * *", async () => {
    console.log("เริ่มการลบคำขอการจองที่หมดอายุ");

    const today = new Date();

    try {
      const approvedDeleted = await prisma.booking.deleteMany({
        where: {
          status: "APPROVED",
          date: {
            lte: today,
          },
        },
      });

      const rejectedDeleted = await prisma.booking.deleteMany({
        where: {
          status: "REJECTED",
        },
      });

      console.log(
        `Deleted ${approvedDeleted.count} APPROVED bookings (expired)`
      );
      console.log(`Deleted ${rejectedDeleted.count} REJECTED bookings`);
    } catch (error) {
      console.error("Error in cleanup job:", error);
    }
  });
};

// รีเซท รถยอดนิยม จองรถ ถูกใจ
exports.resetRecomendationCar = () => {
  cron.schedule("0 0 * * 1", async () => {
    try {
      await prisma.car.updateMany({
        data: {
          totalBookings: 0,
          totalBookings: 0,
        },
      });
      console.log("รีเซ็ทรายการแนะนำเรียบร้อย");
    } catch (err) {
      console.error("รีเซ็ทล้มเหลว ซัมติงวอง", err);
    }
  });
};

// หน้าแสดงรถยอดนิยม
exports.getPopularBookingsCars = async (req, res) => {
  try {
    const cars = await prisma.car.findMany({
      where: {
        totalBookings: {
          gt: 0,
        },
      },
      orderBy: [{ totalBookings: "desc" }],
      take: 5,
      include: {
        images: true,
      },
    });
    res.json(cars);
  } catch (err) {
    console.error("getPopolarCars", err);
    res.status(500).json({ message: "โหลดข้อมูลล้มเหลว" });
  }
};

exports.getPopularFavoritesCars = async (req, res) => {
  try {
    const cars = await prisma.car.findMany({
      where: {
        totalFavorites: {
          gt: 0,
        },
      },
      orderBy: [{ totalFavorites: "desc" }],
      take: 5,
      include: {
        images: true,
      },
    });
    res.json(cars);
  } catch (err) {
    console.error("getPopolarCars", err);
    res.status(500).json({ message: "โหลดข้อมูลล้มเหลว" });
  }
};

// newcar
exports.getNewCar = async (req, res) => {
  try {
    const sevenDays = new Date();
    sevenDays.setDate(sevenDays.getDate() - 7);

    const newCars = await prisma.car.findMany({
      where: {
        createdAt: {
          gte: sevenDays,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        images: true,
      },
    });

    res.json({
      success: true,
      count: newCars.length,
      cars: newCars,
    });
  } catch (err) {
    console.error("getNewCars", err);
    res.status(500).json({ success: false, message: "เกิดข้อผิดพลาด" });
  }
};

exports.sendVerifyEmail = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) return res.status(404).json({ message: "ไม่พบผู้ใช้นี้" });
    if (user.emailVerified) {
      return res.status(400).json({ message: "อีเมลนี้ถูกยืนยันแล้ว " });
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    const verifyUrl = `${process.env.FRONTEND_URL}/verifyemail?token=${token}`;

    if (process.env.NODE_ENV === "development") {
      console.log(`Verify URL: ${verifyUrl}`);
    } else {
      await resend.emails.send({
        from: process.env.EMAIL_FROM,
        to: user.email,
        subject: "ยืนยันอีเมลคุณ",
        html: `<p>สวัสดีคุณ ${user.name} ${user.surname}</p> <p>กดที่ลิ้งเพื่อยืนยัน : <a href="${verifyUrl}"></a>${verifyUrl}</p>`,
      });
    }

    res.json({ message: "ส่งอีเมลยืนยันแล้ว" });
  } catch (err) {
    console.error("ส่งอีเมลยืนยันไม่สำเร็จ", err);
    res.status(500).json({ message: "เกิดข้อผิดพลาดที่ server" });
  }
};

// ยืนยันอีเมล
exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    await prisma.user.update({
      where: { id: payload.userId },
      data: { emailVerified: true },
    });

    res.json({ message: "อีเมลถูกยืนยันแล้ว" });
  } catch (err) {
    res.status(400).json({ error: "โทเค่นผิดหรือหมดอายุ" });
  }
};

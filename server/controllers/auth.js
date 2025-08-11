
const prisma = require('../prisma/prisma');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);
const JWT_SECRET = process.env.JWT_SECRET;

exports.register = async (req, res) => {
  try {
    const { name, surname, email, password, phone } = req.body;

    // Validation
    if (!name || !surname || !email || !password || !phone) {
      return res.status(400).json({ message: 'กรอกข้อมูลให้ครบ' });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'รูปแบบอีเมลไม่ถูกต้อง' });
    }
    if (password.length < 8 || !/[a-zA-Z]/.test(password)) {
      return res.status(400).json({
        message: 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร และมีตัวอักษรอย่างน้อย 1 ตัว',
      });
    }

    // Check duplicate
    if (await prisma.user.findUnique({ where: { email } })) {
      return res.status(400).json({ message: 'อีเมลนี้ถูกใช้งานแล้ว' });
    }
    if (await prisma.user.findUnique({ where: { phone } })) {
      return res.status(400).json({ message: 'เบอร์นี้ถูกใช้งานแล้ว' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        surname,
        email,
        password: hashedPassword,
        phone,
        emailVerified: false
      },
      select: {
        id: true,
        name: true,
        surname: true,
        email: true,
        phone: true,
        role: true,
        emailVerified: true
      },
    });

    return res.status(201).json({
      message: 'สมัครสมาชิกสำเร็จแล้ว (กรุณายืนยันอีเมลในหน้าโปรไฟล์)',
      user,
    });
  } catch (err) {
    console.error('สมัครสมาชิกไม่สำเร็จ', err);
    return res.status(500).json({ message: 'เกิดข้อผิดพลาดที่ server' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'กรุณากรอกอีเมลและรหัสผ่าน' });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(400).json({ message: 'ไม่พบผู้ใช้นี้' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'รหัสผ่านไม่ถูกต้อง' });
    }

    const payload = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      emailVerified: user.emailVerified
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });

    return res.json({
      message: 'เข้าสู่ระบบสำเร็จ',
      user: payload,
      token,
    });
  } catch (err) {
    console.error('Login Error:', err);
    return res.status(500).json({ message: 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ' });
  }
};

//ลืมพาสเวิดส่งเมล
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: "กรุณาระบุอีเมล" });

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(404).json({ message: "ไม่พบผู้ใช้อีเมลนี้" });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

    await resend.emails.send({
      from: process.env.EMAIL_FROM, 
      to: user.email,
      subject: "รีเซ็ทรหัสผ่าน",
      html: `<p>คลิกที่ลิงก์นี้เพื่อรีเซ็ตรหัสผ่านของคุณ (ลิงก์นี้จะหมดอายุใน 1 ชั่วโมง):</p>
             <a href="${resetLink}">${resetLink}</a>`,
    });

    res.json({ message: "ส่งลิ้งรีเซ็ตรหัสผ่านไปยังอีเมลเรียบร้อย" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "เกิดข้อผิดพลาดในระบบ" });
  }
};

// ยืนยันรีเซ้ทพาสเวิด ไว้เช็คเวลาลิ้งหน้าเว็บ
exports.verifyReset = async (req, res) => {
  const { token } = req.query
  const JWT_SECRET = process.env.JWT_SECRET

  if (!token) {
    return res.status(400).json({ message: "ไม่มี Token"})
  }
  
  try {
    jwt.verify(token, JWT_SECRET)
    return res.json({ message: "Token ใช้ได้นี่"})
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(400).json({ message: "ลิงก์หมดอายุ"})
    }
    return res.status(400).json({ message: "Token Invalid"})
  }
}

//รีเซ็ทพาสเวิด
exports.updatePassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ message: "กรุณาระบุ token และรหัสผ่านใหม่" });
    }

    const decoded = jwt.verify(token, JWT_SECRET);

    const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
    if (!user) {
      return res.status(404).json({ message: "ไม่พบผู้ใช้" });
    }

    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      return res.status(400).json({ message: "รหัสผ่านใหม่ห้ามซ้ำกับรหัสเดิม" });
    }

    const passwordRegex = /^(?=.*[A-Za-z]).{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({
        message: "รหัสผ่านต้องมีอย่างน้อย 8 ตัว และมีตัวอักษรภาษาอังกฤษอย่างน้อย 1 ตัว"
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: decoded.userId },
      data: { password: hashedPassword }
    });

    res.json({ message: "เปลี่ยนรหัสผ่านสำเร็จ" });
  } catch (err) {
    console.error("updatePassword error:", err);
    res.status(500).json({ message: "เกิดข้อผิดพลาด" });
  }
};

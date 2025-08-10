
const prisma = require('../prisma/prisma');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

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



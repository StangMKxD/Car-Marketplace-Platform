const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;

const authenticateToken = (req, res, next) => {
  // 1. ดึง token จาก header หรือ query หรือ body
  let token = null;

  const authHeader = req.headers["authorization"];
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  } else if (req.query.token) {
    token = req.query.token;
  } else if (req.body.token) {
    token = req.body.token;
  }

  // 2. ถ้าไม่มี token
  if (!token) {
    return res.status(401).json({ message: "ต้องเข้าสู่ระบบก่อน" });
  }

  // 3. ตรวจสอบ token
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      if (err.name === "TokenExpiredError") {
        return res.status(401).json({ message: "โทเค่นหมดอายุ" });
      }
      return res.status(403).json({ message: "โทเค่นไม่ถูกต้อง" });
    }
    req.user = user;
    next();
  });
};

const authorizeRole = (role) => {
  return (req, res, next) => {
    if (!req.user || req.user.role !== role) {
      return res.status(403).json({ message: "ไม่มีสิทธิ์เข้าถึง" });
    }
    next();
  };
};

module.exports = { authenticateToken, authorizeRole };

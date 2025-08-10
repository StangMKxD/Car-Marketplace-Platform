const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET;

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader)
    return res.status(401).json({ message: "ต้องเข้าสู่ระบบก่อน" });

  const token = authHeader.split(" ")[1];
  if (!token)
    return res.status(401).json({ message: "ต้องเข้าสู่ระบบก่อน" });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: "โทเค่น ผิด" });
    req.user = user; 
    next();
  });
}

const authorizeRole = (role) => {
  return (req, res, next) => {
    if (req.user.role !== role) {
      return res.status(403).json({ message: "ไม่มีสิทธิเช้าถึง" });
    }
    next();
  };
}



module.exports = { authenticateToken, authorizeRole };



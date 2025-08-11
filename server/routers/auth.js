const express = require("express");
const router = express.Router();
const auth = require("../controllers/auth");
const user = require("../controllers/user");
const admin = require("../controllers/admin");
const { authenticateToken, authorizeRole } = require("../middleware/auth");
const { upload } = require("../middleware/upload");

// Auth login register
router.post("/register", auth.register);
router.post("/forgot-password", auth.forgotPassword)
router.get("/reset-password", authenticateToken, auth.verifyReset)
router.post("/reset-password/update", auth.updatePassword)
router.post("/login", auth.login);

// ทุกคนดูรถได้
router.get("/cars", admin.getAllCars);
router.get("/cars/:id", admin.getCar);
router.get("/bkcars", user.getPopularBookingsCars);
router.get("/fvcars", user.getPopularFavoritesCars);

// ต้อง login ก่อนถึงเข้าได้
router.use(authenticateToken);

// User Role
router.get("/user/comparecar/", authenticateToken, user.getCompare);
router.post("/user/comparecar/", authenticateToken, user.toggleCompare);

router.post("/send-verifyemail", authenticateToken, user.sendVerifyEmail);
router.get("/verifyemail", user.verifyEmail);

router.get("/user/profile", authenticateToken, user.getProfile);
router.put("/user/updateprofile", authenticateToken, user.updateProfile);

router.post("/user/bookings", authenticateToken, user.createBooking);
router.get("/user/mybookings", authenticateToken, user.getBooking);
router.delete("/user/mybookings/:id", authenticateToken, user.removeBooking);

router.post("/user/addfavorite-cars", authenticateToken, user.addFavoriteCar);
router.get("/user/myfavorite-cars", authenticateToken, user.getFavoriteCar);
router.delete(
  "/user/myfavorite-cars/:carId",
  authenticateToken,
  user.removeFavoriteCar
);

// Admin Role
router.get(
  "/userlist/bookinglist",
  authenticateToken,
  authorizeRole("ADMIN"),
  admin.getAllBookings
);
router.put(
  "/userlist/bookinglist/:id",
  authenticateToken,
  authorizeRole("ADMIN"),
  admin.updateBookingStatus
);

router.get(
  "/userlist",
  authenticateToken,
  authorizeRole("ADMIN"),
  admin.userList
);
router.delete(
  "/userlist/:id",
  authenticateToken,
  authorizeRole("ADMIN"),
  admin.deleteUser
);

router.post(
  "/cars",
  authenticateToken,
  authorizeRole("ADMIN"),
  upload.array("images", 10),
  admin.createCar
);
router.put(
  "/cars/:id",
  authenticateToken,
  authorizeRole("ADMIN"),
  admin.updateCar
);
router.delete(
  "/cars/:id",
  authenticateToken,
  authorizeRole("ADMIN"),
  admin.deleteCar
);

module.exports = router;

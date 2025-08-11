const express = require("express");
const app = express();
const morgan = require("morgan");
const { readdirSync } = require("fs");
const cors = require("cors");
const { startBookingCleanupJob, resetRecomendationCar } = require("./controllers/user");

require("dotenv").config();

app.use(morgan("dev"));
app.use(
  cors({
    origin: "http://localhost:3000", 
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static("uploads"));
readdirSync("./routers").map((r) => {
  console.log("📦 โหลด route:", r);
  app.use("/api", require("./routers/" + r));
});

startBookingCleanupJob()
resetRecomendationCar()

app.listen(5000, () => console.log("Server is running on port 5000"));

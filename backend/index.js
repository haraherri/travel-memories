const express = require("express");
const app = express();
const path = require("path");
const cookieParser = require("cookie-parser");
const { errorHandler, CustomError } = require("./middlewares/error");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const cors = require("cors"); // Thêm dòng này
dotenv.config();
const authRoute = require("./routes/auth");
const travelRoute = require("./routes/travel");
const PORT = process.env.PORT || 8000;

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());

app.use(cookieParser(process.env.COOKIE_SECRET));

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api/auth", authRoute);
app.use("/api/travel", travelRoute);

(async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`Backend server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start the server:", error);
    process.exit(1);
  }
})();

app.use(errorHandler);

const express = require("express");
const app = express();
const cors = require("cors");
const morgan = require("morgan");
const routes = require("./routes/index");

// Enable CORS for all requests
app.use(cors());

// Enable morgan for logging request details
app.use(morgan("combined"));

// Middleware to parse incoming request bodies
app.use(express.json());
app.get("/", (req, res) => {
  return res.status(200).json({
    success: true,
    message: "WELCOME TO HER HEALTH MANAGEMENT SYSTEM API",
  });
});
app.use("/api/v1", routes);
require("./database/database").connectDB();

app.use((err, req, res, next) => {
  const statusCode = err.statusCode ? err.statusCode : 500;
  const message = err.message ? err.message : "Internal server error";
  return res.status(statusCode).json({ success: false, message });
});

module.exports = app;

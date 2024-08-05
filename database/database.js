const mongoose = require("mongoose");
require("dotenv").config();
module.exports = {
  connectDB: () => {
    // Connect to MongoDB database
    mongoose.connect(process.env.MONGODB_URL);
    const dbConnection = mongoose.connection;
    dbConnection.on("error", (err) =>
      console.error("Database connection error:", err)
    );
    dbConnection.once("open", () =>
      console.log("Database connected successfully")
    );
  },
};



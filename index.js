
import express from "express";
import dotenv from "dotenv";
dotenv.config();
import { connectDB } from "./config/db.js";


import productRouter from "./routes/productRoute.js";
import stockRouter from "./routes/stockRoute.js";

const app = express();
app.use(express.json());


app.use((req, res, next) => {
  
  req.user = { id: "test-user", role: "admin" };
  next();
});

app.use("/products", productRouter);
app.use("/stock", stockRouter);


app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(err.status || 500).json({ success: false, error: err.message || "Internal Server Error" });
});

const PORT = process.env.PORT || 4000;

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Failed to connect to DB", err);
    process.exit(1);
  });

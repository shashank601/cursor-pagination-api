import express from "express";
import dotenv from "dotenv";
dotenv.config();
import cors from "cors";
import routes from "./product-route.js";
import pool from "./config-db.js";


const app = express();
const PORT = process.env.PORT || 3000;

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://127.0.0.1:5500",
    credentials: true,
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/health", (req, res) => {
  res.json({ message: "server is alive" });
});

app.use("/api", routes);

async function startServer() {
  try {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server started on port ${PORT}`);
    });
  } catch (error) {
    console.error("Server startup failed:", error);
    process.exit(1);
  }
}

startServer();

